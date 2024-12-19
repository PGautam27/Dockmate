const fs = require('fs-extra');
const ejs = require('ejs');
const path = require('path');

async function generateDockerfile(framework, options) {
  const templatePath = path.join(__dirname, 'templates', `${framework}.ejs`);
  const outputPath = './Dockerfile';

  if (!fs.existsSync(templatePath)) {
    throw new Error(`No template found for framework: ${framework}`);
  }

  const dockerfileContent = await ejs.renderFile(templatePath, options);
  fs.writeFileSync(outputPath, dockerfileContent);
  console.log('Dockerfile created successfully!');
}

module.exports = { generateDockerfile };
