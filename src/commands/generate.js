const { handleGenerate } = require('../utils/cli_utils');

module.exports = {
  command: 'generate',
  describe: 'Generate Dockerfile for the project',
  builder: (yargs) => {
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
  handler: async (argv) => handleGenerate(argv)
};
