const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const generateDockerfile = async (framework, options) => {
  if (framework !== 'node') {
    throw new Error('Unsupported framework for this step. Only Node.js is supported.');
  }

  const templatePath = path.join(__dirname, 'templates', 'node.ejs');
  const outputPath = path.join(process.cwd(), 'Dockerfile');

  const data = {
    nodeVersion: options.nodeVersion || '18',
    port: options.port || 3000,
    entryPoint: options.entryPoint || 'index.js',
  };

  try {
    const template = await fs.promises.readFile(templatePath, 'utf8');
    const renderedDockerfile = ejs.render(template, data);
    await fs.promises.writeFile(outputPath, renderedDockerfile);

    console.log(`Dockerfile for Node.js generated at ${outputPath}`);
  } catch (err) {
    console.error('Error generating Dockerfile:', err);
    throw err;
  }
};

module.exports = { generateDockerfile };
