const chokidar = require('chokidar');
const {generateDockerfile} = require('./dockerfile-generator');
const {executeCommand} = require('./image-builder')
const {detectFramework} = require('./framework-detector');
const {deriveOptionsFromDockerfile} = require('./dockerfile-generator');
const fs = require('fs-extra');

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
        console.log('[INFO] Updating DockerFile...');
        const framework = await detectFramework();
        const options = await deriveOptionsFromDockerfile(dockerfilePath);
        if(framework==="node") {
            const packageJson = JSON.parse(await fs.readFile('./package.json', 'utf-8'));
            options.entryPoint = packageJson.main || 'index.js';
        }
        await generateDockerfile(framework, options);
        console.log('[INFO] DockerFile updated successfully!');

        console.log('[INFO] Rebuilding the Docker image...');
        await rebuildImage(dockerfilePath,imageName);
  
        if (autoRestart) {
          console.log('[INFO] Restarting the container...');
          restartContainer(containerName,imageName);
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


async function rebuildImage(dockerfilePath,imageName) {   
    const buildCommand = `docker build -f ${dockerfilePath} -t ${imageName} .`;

    try {
        await executeCommand(buildCommand);
        console.log(`[SUCCESS] Docker image '${imageName}' built successfully!`);
    } catch (err) {
        throw new Error(`Docker image build failed: ${err.message}`);
    }
}

async function restartContainer(containerName, imageName) {

    const remCommand = `docker rm -f ${containerName}`;
    try {
        await executeCommand(remCommand);
    } catch (err) {
        throw new Error(`Failed to remove container: ${err.message}`);
    }

    const startCommand = `docker run -d --name ${containerName} ${imageName}`;
    try{
        await executeCommand(startCommand);
        console.log('[INFO] Container started successfully!');
    }catch (err) {
        throw new Error(`Failed to start container: ${err.message}`);
    }
}

module.exports = { startDevMode };