const {devMode} = require('../utils/cli_utils');

module.exports = {
    command: 'dev',
    describe: 'Run the container in development mode with live reload (interactive)',
    builder: (yargs) => {},
    handler: async () => devMode()
};