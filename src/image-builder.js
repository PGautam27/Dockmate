const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { generateDockerfile } = require('./dockerfile-generator'); // Import the Dockerfile generator

/**
 * Build a Docker image from an existing or generated Dockerfile.
 * @param {Object} options - The options for building the image.
 * @param {string} options.tag - The tag for the Docker image (e.g., `myapp:latest`).
 * @param {boolean} options.dockerfilePresent - Indicates if the Dockerfile is already present.
 * @param {string} options.framework - Framework name, required if Dockerfile needs to be generated.
 * @param {Object} options.generateOptions - Additional options for Dockerfile generation.
 * @param {string} options.imageName - Image name, optional only if the user wants it. But prefered to have it.
 */
async function buildImage(options) {
  const {
    tag,
    dockerfilePresent = true,
    framework,
    imageName,
    generateOptions = {},
  } = options;

  const dockerfilePath = path.join(process.cwd(), 'Dockerfile');

  // Step 1: Check for Dockerfile presence
  if (!dockerfilePresent || !fs.existsSync(dockerfilePath)) {
    if (!framework) {
      throw new Error(
        'Framework is required to generate a Dockerfile. Pass the framework name in options.'
      );
    }

    console.log('[INFO] Dockerfile not found or indicated as missing. Generating one...');
    try {
        
      await generateDockerfile(framework, generateOptions);
      console.log('[INFO] Dockerfile generated successfully!');
    } catch (err) {
      throw new Error(`Failed to generate Dockerfile: ${err.message}`);
    }
  } else {
    console.log('[INFO] Dockerfile is present. Skipping generation step.');
  }

  // Step 2: Build the Docker image
  console.log(`[INFO] Building Docker image with tag: ${tag}...`);
  const buildCommand = `docker build -t ${imageName}:${tag} .`;

  try {
    await executeCommand(buildCommand);
    console.log(`[SUCCESS] Docker image '${imageName}:${tag}' built successfully!`);
  } catch (err) {
    throw new Error(`Docker image build failed: ${err.message}`);
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
        console.error(`[ERROR] ${stderr}`);
        return reject(error);
      }
      console.log(stdout);
      resolve();
    });
  });
}

module.exports = { buildImage, executeCommand };
