const {deleteAllBackups} = require('../core/backup-undo-delete');

module.exports = {
    command: 'delete-backups',
    describe: 'Delete all backups of Dockerfile',
    builder: (yargs) => {},
    handler: async () => deleteAllBackups()
};