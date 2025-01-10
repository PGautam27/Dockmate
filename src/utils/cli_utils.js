const { generateDockerfile } = require('../core/dockerfile-generator');
const { detectFramework } = require('../core/framework-detector');
const {log} = require('./logger');
const fs = require('fs-extra');
const {    
  ensureBackupDir,
  backupDockerfile,
  undoBackup,
  deleteAllBackups,
  backupDirExists} = require('../core/backup-undo-delete');
const {buildImage} = require('../core/image-builder');
const {runContainer} = require('../core/container-runner');
const inquirer = require('inquirer');
const {startDevMode } = require('../core/docker-dev');

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

  async function handleBuildImage(argv) {
    try {
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
    } catch (err) {
      log.error(`Build image failed: ${err.message}`);
      process.exit(1);
    }
}

async function runImageCont(argv) {
  const { image, port, env, name } = argv;
  try {
    await runContainer({
      imageName: image,
      ports: port,
      env,
      containerName: name,
    });
    log.info('Container started successfully!');
  } catch (err) {
    console.error(`Error: ${err.message}`);
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

async function devMode (){
  const options = await promptDevOptions();
  await startDevMode(options);
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

async function takeBackup(){
  const backupdir = await ensureBackupDir();
  if(backupdir){
    await backupDockerfile();
  }
}

async function undoDockerFile(args) {
  const backupFileName = args.backup || null;
  await undoBackup(backupFileName);
}

  module.exports = {
    handleGenerate,
    handleBuildImage,
    runImageCont,
    devMode,
    handleInteractiveInit,
    takeBackup,
    undoDockerFile
  };