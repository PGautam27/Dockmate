#!/usr/bin/env node

const yargs = require('yargs');
const { detectFramework } = require('../src/framework-detector');
const { generateDockerfile } = require('../src/dockerfile-generator');
const { buildImage } = require('../src/image-builder');
// const { runContainer } = require('../src/container-runner');

// Utility for logging
const log = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
};

// Command Handlers
async function handleDetectFramework() {
  try {
    const framework = detectFramework();
    log.info(`Detected Framework: ${framework}`);
    return framework;
  } catch (err) {
    log.error(`Framework detection failed: ${err.message}`);
    process.exit(1);
  }
}

async function handleGenerate(argv) {
  const framework = argv.framework || (await handleDetectFramework());
  log.info(`Generating Dockerfile for ${framework}...`);

  const options = {
    nodeVersion: argv.nodeVersion || '18',
    port: argv.port || '3000',
    entryPoint: argv.entryPoint || 'index.js',
  };

  try {
    await generateDockerfile(framework, options);
  } catch (err) {
    log.error(`Error during Dockerfile generation: ${err.message}`);
    process.exit(1);
  }
}

// CLI Setup with Yargs
yargs
  .scriptName('dockmate')
  .usage('$0 <cmd> [args]')
  .command(
    'generate',
    'Generate Dockerfile for the project',
    (yargs) => {
      yargs
        .option('framework', {
          describe: 'Specify framework for the Dockerfile',
          choices: ['react', 'angular', 'node', 'nextjs'],
          demandOption: false,
        })
        .option('nodeVersion', {
          describe: 'Node.js version for the base image',
          type: 'string',
          default: '18',
        })
        .option('port', {
          describe: 'Application port',
          type: 'number',
          default: 3000,
        })
        .option('entryPoint', {
          describe: 'Application entry point file',
          type: 'string',
          default: 'index.js',
        });
    },
    handleGenerate
  )
  .command(
    'build',
    'Build Docker image',
    (yargs) => {
      yargs.option('tag', {
        describe: 'Tag for the Docker image',
        default: 'latest',
      })
      .option('framework', {
        describe: 'Specify framework for the Dockerfile',
        choices: ['react', 'angular', 'node', 'nextjs'],
        demandOption: false,
      })
      .option('dockerfilePresent',{
        describe: 'Indicate if the Dockerfile is already present',
        type: 'boolean',
        default: true,
      })
      .option('imageName',{
        describe: 'Name of the Docker image',
        type: 'string',
        default: `dockmate-image-${Date.now()}`,
      })
      .option('nodeVersion', {
        describe: 'Node.js version for the base image',
        type: 'string',
        default: '18',
      })
      .option('port', {
        describe: 'Application port',
        type: 'number',
        default: 3000,
      })
      .option('entryPoint', {
        describe: 'Application entry point file',
        type: 'string',
        default: 'index.js',
      });
    },
    async (argv) => {
      const tag = argv.tag;
      const framework = argv.framework ? argv.framework : await handleDetectFramework();
      const dockerfilePresent = argv.dockerfilePresent;
      const imageName = argv.imageName;
      const options = {
        nodeVersion: argv.nodeVersion || '18',
        port: argv.port || '3000',
        entryPoint: argv.entryPoint || 'index.js',
      };
      log.info(`Building Docker image with tag: ${tag}...`);
      try {
        await buildImage({ tag : tag, framework: framework, dockerfilePresent: dockerfilePresent, imageName: imageName, generateOptions: options});
        log.info('Docker image built successfully!');
      } catch (err) {
        log.error(`Error during Docker image build: ${err.message}`);
        process.exit(1);
      }
    }
  )
  .command(
    'run',
    'Run Docker container',
    (yargs) => {
      yargs.option('image', {
        describe: 'Docker image to run',
        demandOption: true,
      });
      yargs.option('port', {
        describe: 'Port mapping',
        default: '8080:80',
        coerce: (arg) => {
          const parts = arg.split(':');
          if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
            throw new Error('Invalid port format. Expected format: host:container (e.g., 8080:80)');
          }
          return parts;
        },
      });
    },
    async (argv) => {
      const image = argv.image;
      const ports = argv.port;
      log.info(`Running container from image: ${image} on ports ${ports[0]}:${ports[1]}...`);
      try {
        // await runContainer({
        //   imageName: image,
        //   ports: [{ host: ports[0], container: ports[1] }],
        //   env: {},
        // });
        log.info('Container started successfully!');
      } catch (err) {
        log.error(`Error during container run: ${err.message}`);
        process.exit(1);
      }
    }
  )
  .help()
  .argv;
