const chokidar = require('chokidar');
const { spawn } = require('child_process');

async function startDevMode({ watchPaths, dockerfilePath, containerName, autoRestart,imageName }) {
    console.log('[INFO] Starting development mode...');
    console.log(`[INFO] Watching paths: ${watchPaths.join(', ')}`);
  
    const watcher = chokidar.watch(watchPaths, {
      ignored: /node_modules|\.git/,
      persistent: true,
    });
  
    watcher
      .on('change', async (path) => {
        console.log(`[INFO] File changed: ${path}`);
        console.log('[INFO] Rebuilding the Docker image...');
        await rebuildImage(dockerfilePath,imageName);
  
        if (autoRestart) {
          console.log('[INFO] Restarting the container...');
          restartContainer(containerName);
        } else {
          console.log('[INFO] Skipping container restart (auto-restart disabled).');
        }
      })
      .on('ready', () => {
        console.log('[INFO] Initial scan complete. Watching for changes...');
      });
  
    process.on('SIGINT', () => {
      console.log('\n[INFO] Stopping watcher...');
      watcher.close();
      process.exit(0);
    });
}


function rebuildImage(dockerfilePath,imageName) {
    return new Promise((resolve, reject) => {
        const dockerBuild = spawn('docker', [
        'build',
        '-f',
        dockerfilePath,
        '-t',
        `${imageName}`,
        '.',
        ]);

        dockerBuild.stdout.on('data', (data) => process.stdout.write(data));
        dockerBuild.stderr.on('data', (data) => process.stderr.write(data));

        dockerBuild.on('close', (code) => {
        if (code === 0) {
            console.log('[INFO] Docker image built successfully!');
            resolve();
        } else {
            console.error('[ERROR] Failed to build Docker image.');
            reject();
        }
        });
    });
}

function restartContainer(containerName) {
    const dockerStop = spawn('docker', ['stop', containerName]);
    dockerStop.stdout.on('data', (data) => process.stdout.write(data));
    dockerStop.stderr.on('data', (data) => process.stderr.write(data));

    dockerStop.on('close', (code) => {
        if (code === 0) {
        console.log('[INFO] Container stopped successfully!');
        const dockerStart = spawn('docker', ['start', containerName]);
        dockerStart.stdout.on('data', (data) => process.stdout.write(data));
        dockerStart.stderr.on('data', (data) => process.stderr.write(data));
        } else {
        console.error('[ERROR] Failed to stop the container.');
        }
    });
}

module.exports = { startDevMode };