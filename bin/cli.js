#!/usr/bin/env node
const { detectFramework } = require('../src/framework-detector');
const { generateDockerfile } = require('../src/dockerfile-generator');
const { buildImage } = require('../src/image-builder');
const { runContainer } = require('../src/container-runner');

(async () => {
  const framework = detectFramework();
  console.log(`Detected Framework: ${framework}`);

  try {
    await generateDockerfile(framework, {});
    await buildImage({ tag: `${framework}-app:latest` });
    await runContainer({
      imageName: `${framework}-app:latest`,
      ports: [{ host: 8080, container: 80 }],
      env: {},
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
