const {runImageCont} = require('../utils/cli_utils');
  module.exports = {
    command: 'run',
    describe: 'Run Docker container',
    builder: (yargs) => {
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
    handler: async (argv) => runImageCont(argv)
  };