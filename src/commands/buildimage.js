const {handleBuildImage} = require('../utils/cli_utils');

module.exports = {
    command: 'build',
    describe: 'Build Docker image',
    builder: (yargs) => {
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
    handler: async (argv) => handleBuildImage(argv)
  };