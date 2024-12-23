#!/usr/bin/env node

const yargs = require('yargs');
const { detectFramework } = require('../src/framework-detector');
const { generateDockerfile } = require('../src/dockerfile-generator');
const { buildImage } = require('../src/image-builder');
const { runContainer } = require('../src/container-runner');
const inquirer = require('inquirer');

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

async function handleInteractiveInit() {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
        message: 'What framework does your project use?',
        choices: ['React', 'Angular', 'Vue', 'Next.js', 'Node.js'],
      },
      {
        type: 'input',
        name: 'port',
        message: 'What port does your application listen on?',
        default: '3000',
      },
      {
        type: 'input',
        name: 'entryPoint',
        message: 'What is the entry point for your application?',
        default: 'index.js',
      },
      {
        type: 'confirm',
        name: 'addEnvironmentFile',
        message: 'Does your project use a .env file?',
        default: true,
      },
    ]);
    log.info('Answers:', answers);

    log.info('Generating Dockerfile based on your inputs...');
    await generateDockerfile(answers.framework.toLowerCase(), {
      port: answers.port,
      entryPoint: answers.entryPoint,
      useEnv: answers.addEnvironmentFile,
    });

    log.info('Dockerfile created successfully!');
  } catch (err) {
    log.error(`Error during interactive setup: ${err.message}`);
    process.exit(1);
  }
}

// CLI Setup with Yargs
yargs
  .scriptName('dockmate')
  .usage('$0 <cmd> [args]')
  .command(
    'init',
    'Interactive UI for Dockerfile creation',
    () => {},
    handleInteractiveInit
  )
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
      .option('name',{
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
      const imageName = argv.name;
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
  // this is a function that is not that needed. Cause normal docker run command is much better, just made it to feel satisified
  .command(
    'run',
    'Run Docker container',
    (yargs) => {
      yargs
        .option('image', {
          describe: 'Docker image to run',
          demandOption: true,
        })
        .option('port', {
          describe: 'Port mapping (format: host:container)',
          type: 'array',
          default: [],
          coerce: (args) =>
            args.map((arg) => {
              const [host, container] = arg.split(':').map(Number);
              if (isNaN(host) || isNaN(container)) {
                throw new Error(`Invalid port mapping: ${arg}`);
              }
              return { host, container };
            }),
        })
        .option('env', {
          describe: 'Environment variables (format: KEY=value)',
          type: 'array',
          default: [],
          coerce: (args) =>
            args.reduce((acc, arg) => {
              const [key, value] = arg.split('=');
              acc[key] = value;
              return acc;
            }, {}),
        })
        .option('name', {
          describe: 'Name of the container',
          type: 'string',
        });
    },
    async (argv) => {
      const { image, port, env, name } = argv;
      try {
        await runContainer({
          imageName: image,
          ports: port,
          env,
          containerName: name,
        });
        console.log('Container started successfully!');
      } catch (err) {
        console.error(`Error: ${err.message}`);
      }
    }
  )
  .help()
  .argv;
