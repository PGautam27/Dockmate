#!/usr/bin/env node

const yargs = require('yargs');
const { detectFramework } = require('../src/framework-detector');
const { generateDockerfile } = require('../src/dockerfile-generator');
const { buildImage } = require('../src/image-builder');
const { runContainer } = require('../src/container-runner');
const {startDevMode } = require('../src/docker-dev');
const {    
  ensureBackupDir,
  backupDockerfile,
  undoBackup,
  deleteAllBackups,
  backupDirExists} = require('../src/backup-undo-delete');
const inquirer = require('inquirer');
const fs = require('fs-extra');

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

async function previewDockerfile(framework, options) {
  try {
    const content = await generateDockerfile(framework, options, { preview: true });
    console.log('\n--- Dockerfile Preview ---\n');
    console.log(content);

    // Confirm if the user wants to save the file
    const { confirmSave } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmSave',
        message: 'Do you want to save this Dockerfile?',
        default: false,
      },
    ]);

    if (!confirmSave) {
      log.info('Dockerfile generation cancelled.');
      return false;
    }
    return true;
  } catch (err) {
    log.error(`Error during Dockerfile preview: ${err.message}`);
    process.exit(1);
  }
}

async function handleGenerate(argv) {
  const framework = argv.framework || (await handleDetectFramework());
  log.info(`Generating Dockerfile for ${framework}...`);
  const useEnv = fs.existsSync('.env') ? true : false;
  const options = {
    nodeVersion: argv.nodeVersion || '18',
    port: argv.port || '3000',
    entryPoint: argv.entryPoint || 'index.js',
    useEnv: useEnv,
  };

  if(framework === 'node'){
    const packageJson = JSON.parse(await fs.readFile('./package.json', 'utf-8'));
    options.entryPoint = packageJson.main || 'index.js';
  }

  try {

    if (argv.preview) {
      const preview = await previewDockerfile(framework, options);
      if (!preview) {
        return;
      }
    }

    await generateDockerfile(framework, options);
    
    const bkpDirExists = await backupDirExists();
    if(bkpDirExists) {
      log.info('Backing up Dockerfile...');
      await backupDockerfile();
    }

    if(argv.backup && !bkpDirExists){
      log.info('Taking backup of the Dockerfile...');
      const backupdir = await ensureBackupDir();
      if(backupdir){
        await backupDockerfile();
      }
    }

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
        choices: ['react', 'angular', 'vuejs', 'nextjs', 'node','gatsby','sevelte'],
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
        type: 'input',
        name: 'nodeVersion',
        message: 'What version of Node.js should be used?',
        default: '18',
      },
      {
        type: 'confirm',
        name: 'addEnvironmentFile',
        message: 'Does your project use a .env file?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'backup',
        message: 'Do you want to take backup of the Dockerfile?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'preview',
        message: 'Do you want to preview the Dockerfile content?',
        default: false,
      }
    ]);

    if(answers.preview){
      const preview = await previewDockerfile(answers.framework.toLowerCase(), {
        port: answers.port,
        entryPoint: answers.entryPoint,
        nodeVersion: answers.nodeVersion,
        useEnv: answers.addEnvironmentFile,
      });
      if (!preview) {
        return;
      }
    }

    log.info('Generating Dockerfile...');
    await generateDockerfile(answers.framework.toLowerCase(), {
      port: answers.port,
      entryPoint: answers.entryPoint,
      nodeVersion: answers.nodeVersion,
      useEnv: answers.addEnvironmentFile,
    });

    if(answers.backup){
      log.info('Taking backup of the Dockerfile...');
      const backupdir = await ensureBackupDir();
      if(backupdir){
        await backupDockerfile();
      }
    }
  } catch (err) {
    log.error(`Error during interactive setup: ${err.message}`);
    process.exit(1);
  }
}

// interactive cli for rebuild and restart at real time changes of files and directories
async function promptDevOptions() {
  const imagename = `dockmate-${Date.now()}`;
  return await inquirer.prompt([
    {
      type: 'input',
      name: 'watchPaths',
      message: 'Enter the files or directories to watch (comma-separated, eg : ./src, ./index.js):',
      default: './src, ./index.js',
      filter: (input) => input.split(',').map((path) => path.trim()),
    },
    {
      type: 'input',
      name: 'dockerfilePath',
      message: 'Enter the path to the Dockerfile (eg : ./Dockerfile ):',
      default: './Dockerfile',
    },
    {
      type: 'input',
      name: 'imageName',
      message: 'Enter the Docker image name:',
      default:`${imagename}`,
    },
    {
      type: 'input',
      name: 'containerName',
      message: 'Enter the name of the Docker container:',
      default: `${imagename}-container`,
    },
    {
      type: 'confirm',
      name: 'autoRestart',
      message: 'Should the container restart automatically on changes?',
      default: true,
    },
  ]);

}


// CLI Setup with Yargs
yargs
  .scriptName('dockmate')
  .usage('$0 <cmd> [args]')
  .command(
    'dev',
    'Run the container in development mode with live reload (interactive)',
    {},
    async () => {
      const options = await promptDevOptions();
      await startDevMode(options);
    }
  )
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
        .option('preview', {
          describe: 'Preview the Dockerfile content',
          type: 'boolean',
          default: false,
        })
        .option('backup', {
          describe: 'Take backup of the Dockerfile',
          type: 'boolean',
          default: false,
        }
        )
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
      const useEnv = fs.existsSync('.env') ? true : false;
      const options = {
        nodeVersion: argv.nodeVersion || '18',
        port: argv.port || '3000',
        entryPoint: argv.entryPoint || 'index.js',
        useEnv: useEnv,
      };

      if(framework === 'node'){
        const packageJson = JSON.parse(await fs.readFile('./package.json', 'utf-8'));
        options.entryPoint = packageJson.main || 'index.js';
      }

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
  .command(
    'backup',
    'Take backup of the Dockerfile',
    {},
    async () => {
      const backupdir = await ensureBackupDir();
      if(backupdir){
        await backupDockerfile();
      }
    }
  )
  .command(
    'undo [backup]', 
    'Undo changes using a specific backup file', 
    {}, 
    async (args) => {
    const backupFileName = args.backup || null;
    await undoBackup(backupFileName);
  })
  .command(
    'delete-backups',
    'Delete all backups of Dockerfile',
    {},
    async () => {
      await deleteAllBackups();
    }
  )
  .help()
  .argv;
