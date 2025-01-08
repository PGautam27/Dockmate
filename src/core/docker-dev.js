const chokidar = require('chokidar');
const {generateDockerfile} = require('./dockerfile-generator');
const {executeCommand} = require('./image-builder')
const {detectFramework} = require('./framework-detector');
const {deriveOptionsFromDockerfile} = require('./dockerfile-generator');
const {log} = require('../utils/logger');
const fs = require('fs-extra');

async function startDevMode({ watchPaths, dockerfilePath, containerName, autoRestart,imageName }) {
    log.info('Starting development mode...');
    log.info(`Watching paths: ${watchPaths.join(', ')}`);
  
    const watcher = chokidar.watch(watchPaths, {
      ignored: /node_modules|\.git/,
      persistent: true,
    });
  
    watcher
      .on('change', async (path) => {

        log.info(`File changed: ${path}`);
        log.info('Updating DockerFile...');
        const framework = await detectFramework();
        const options = await deriveOptionsFromDockerfile(dockerfilePath);
        if(framework==="node") {
            const packageJson = JSON.parse(await fs.readFile('./package.json', 'utf-8'));
            options.entryPoint = packageJson.main || 'index.js';
        }
        await generateDockerfile(framework, options);
        log.info('DockerFile updated successfully!');

        log.info('Rebuilding the Docker image...');
        await rebuildImage(dockerfilePath,imageName);
  
        if (autoRestart) {
          log.info('Restarting the container...');
          restartContainer(containerName,imageName);
        } else {
          log.info('Skipping container restart (auto-restart disabled).');
        }
      })
      .on('ready', () => {
        log.info('Initial scan complete. Watching for changes...');
      });
  
    process.on('SIGINT', () => {
      log.info('\n Stopping watcher...');
      watcher.close();
      process.exit(0);
    });
}


async function rebuildImage(dockerfilePath,imageName) {   
    const buildCommand = `docker build -f ${dockerfilePath} -t ${imageName} .`;

    try {
        await executeCommand(buildCommand);
        log.success(`Docker image '${imageName}' built successfully!`);
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
        log.success('Container started successfully!');
    }catch (err) {
        throw new Error(`Failed to start container: ${err.message}`);
    }
}

module.exports = { startDevMode };