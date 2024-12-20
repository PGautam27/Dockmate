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
  } catch (err) {
    console.error(`[ERROR] Failed to generate Dockerfile: ${err.message}`);
    throw err; // Bubble up the error to the CLI handler
  }
}

module.exports = { generateDockerfile };
