const {undoDockerFile} = require('../utils/cli_utils');

module.exports = {
    command: 'undo [backup]',
    describe: 'Undo changes using a specific backup file',
    builder: (yargs) => {},
    handler: async (args) => undoDockerFile(args)
};