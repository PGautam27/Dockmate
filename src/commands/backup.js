const {takeBackup} = require('../utils/cli_utils');

module.exports = {
    command: 'backup',
    describe: 'Take backup of the Dockerfile',
    builder: (yargs) => {},
    handler: async () => takeBackup()
};