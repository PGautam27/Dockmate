const fs = require('fs-extra');
const ejs = require('ejs');
const path = require('path');

async function generateDockerfile(framework, options = {}) {
  try {
    const templatePath = path.join(__dirname, 'templates', `${framework}.ejs`);
    const outputPath = './Dockerfile';

    if (!fs.existsSync(templatePath)) {
      throw new Error(`No template found for framework: ${framework}`);
    }

    // Parse environment variables if .env exists and useEnv is true
    let envVariables = [];
    if (options.useEnv && fs.existsSync('.env')) {
      const envContent = await fs.readFile('.env', 'utf-8');
      envVariables = parseEnvFile(envContent);
    }

    console.log('[INFO] Using template:', templatePath);

    // Render the Dockerfile template with the provided options
    const dockerfileContent = await ejs.renderFile(templatePath, {
      ...options,
      envVariables,
    });
    await fs.outputFile(outputPath, dockerfileContent);

    console.log('[INFO] Dockerfile created successfully!');
    await generateDockerignoreFile(options.useEnv);
  } catch (err) {
    console.error('[ERROR] Failed to generate Dockerfile:', err.message);
    throw err; // Bubble up the error to the CLI handler
  }
}

function parseEnvFile(envContent) {
  const lines = envContent.split('\n');
  return lines
    .filter((line) => line.trim() && !line.startsWith('#')) // Ignore empty lines and comments
    .map((line) => {
      const [key, value] = line.split('=');
      return { key: key.trim(), value: value.trim() };
    });
}

async function generateDockerignoreFile(useEnv) {
  const dockerignorePath = './.dockerignore';
  const gitignorePath = './.gitignore';

  const defaultIgnoreList = [
    'node_modules',
    'npm-debug.log',
    'yarn-debug.log',
    'yarn-error.log',
    '.DS_Store',
    '.vscode',
    '.idea',
  ];

  if (useEnv) {
    defaultIgnoreList.push('.env'); // Add .env file to ignore list
  }

  try {
    let dockerignoreContent = defaultIgnoreList.join('\n') + '\n';

    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
      dockerignoreContent += gitignoreContent;
    }

    await fs.writeFile(dockerignorePath, dockerignoreContent);
    console.log('[INFO] .dockerignore file created successfully!');
  } catch (err) {
    console.error('[ERROR] Error during .dockerignore file generation:', err.message);
  }
}

function deriveOptionsFromDockerfile(dockerfilePath) {
  try {
    const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
    const options = {
      nodeVersion: '18', // Default value
      port: '3000', // Default value
      entryPoint: 'index.js', // Default value
      useEnv: false,
    };

    // Extract the Node.js version
    const nodeVersionMatch = dockerfileContent.match(/FROM\s+node:(\d+)/i);
    if (nodeVersionMatch) {
      options.nodeVersion = nodeVersionMatch[1];
    }

    // Extract the exposed port
    const portMatch = dockerfileContent.match(/EXPOSE\s+(\d+)/i);
    if (portMatch) {
      options.port = portMatch[1];
    }

    // Check for .env file usage
    options.useEnv = fs.existsSync('.env') ? true : false;

    return options;
  } catch (error) {
    console.error(`[ERROR] Failed to derive options from Dockerfile: ${error.message}`);
    return null;
  }
}


module.exports = { generateDockerfile, deriveOptionsFromDockerfile };
