const {handleInteractiveInit} = require('../utils/cli_utils');

module.exports = {
    command: 'init',
    describe: 'Interactive UI for Dockerfile creation',
    builder: (yargs) => {},
    handler: async () => handleInteractiveInit()
};