const { exec } = require('child_process');
const {log} = require('../utils/logger');
/**
 * Run a Docker container with specified options.
 * @param {Object} options - The options for running the container.
 * @param {string} options.imageName - The Docker image to run (e.g., `myapp:latest`).
 * @param {Array<{host: number, container: number}>} options.ports - Port mappings in the form of an array of objects.
 * @param {Object} options.env - Environment variables to pass to the container.
 * @param {string} [options.containerName] - Optional name for the container.
 * @param {boolean} [options.detached] - Run the container in detached mode (default: true).
 */
async function runContainer(options) {
  const {
    imageName,
    ports = [],
    env = {},
    containerName,
    detached = true,
  } = options;

  if (!imageName) {
    throw new Error('Image name is required to run a container.');
  }

  // Construct the Docker run command
  let command = `docker run ${detached ? '-d' : ''}`;

  // Add port mappings
  ports.forEach(({ host, container }) => {
    command += ` -p ${host}:${container}`;
  });

  // Add environment variables
  Object.entries(env).forEach(([key, value]) => {
    command += ` -e ${key}=${value}`;
  });

  // Add container name if specified
  if (containerName) {
    command += ` --name ${containerName}`;
  }

  // Add the image name
  command += ` ${imageName}`;

  log.info(`Running container with command: ${command}`);

  try {
    await executeCommand(command);
    log.success(`Container from image '${imageName}' started successfully!`);
  } catch (err) {
    throw new Error(`Failed to run container: ${err.message}`);
  }
}

/**
 * Executes a shell command and returns a Promise.
 * @param {string} command - The shell command to execute.
 * @returns {Promise<void>} - Resolves when the command completes successfully.
 */
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        log.error(`${stderr}`);
        return reject(error);
      }
      log.info(stdout);
      resolve();
    });
  });
}

module.exports = { runContainer };
