const fs = require('fs');

function detectFramework() {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

  if (dependencies.react) return 'react';
  if (dependencies['@angular/core']) return 'angular';
  if (dependencies.next) return 'nextjs';
  if (dependencies.express) return 'node';
  return 'unknown';
}

module.exports = { detectFramework };
