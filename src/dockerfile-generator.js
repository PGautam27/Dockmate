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

    console.log(`[INFO] Using template: ${templatePath}`);

    const dockerfileContent = await ejs.renderFile(templatePath, options);
    await fs.outputFile(outputPath, dockerfileContent);

    console.log('[INFO] Dockerfile created successfully!');
    await generateDockerignoreFile();
  } catch (err) {
    console.error(`[ERROR] Failed to generate Dockerfile: ${err.message}`);
    throw err; // Bubble up the error to the CLI handler
  }
}

async function generateDockerignoreFile() {
    const dockerignorePath = './.dockerignore';
    const gitignorePath = './.gitignore';
    
    // List of default files to ignore
    const defaultIgnoreList = [
      '.env',
      'node_modules',
      'npm-debug.log',
      'yarn-debug.log',
      'yarn-error.log',
      '.DS_Store', // macOS-specific
      '.vscode', // IDE-specific directories
      '.idea' // JetBrains IDE-specific directories
    ];
  
    try {
      // Start by creating a new .dockerignore file with the default ignores
      let dockerignoreContent = defaultIgnoreList.join('\n') + '\n';
  
      // If .gitignore exists, append its content to .dockerignore
      if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
        dockerignoreContent += gitignoreContent;
      }
  
      // Write the content to .dockerignore file
      await fs.writeFile(dockerignorePath, dockerignoreContent);
      console.log('.dockerignore file created successfully!');
    } catch (err) {
      console.error('Error during .dockerignore file generation:', err.message);
    }
  }

module.exports = { generateDockerfile };
