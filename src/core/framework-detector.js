const fs = require('fs');

function detectFramework() {
  try {
    const packageJsonPath = './package.json';
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json not found in the current directory.');
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (dependencies.react) return 'react';
    if (dependencies['@angular/core']) return 'angular';
    if (dependencies.next) return 'nextjs';
    if (dependencies.express) return 'node';
    if (dependencies.svelte) return 'svelte'; 
    if (dependencies.gatsby) return 'gatsby'; 
    if (dependencies.vue) return 'vuejs'; 
    return 'unknown';
  } catch (err) {
    throw new Error(`Error detecting framework: ${err.message}`);
  }
}

module.exports = { detectFramework };
