#!/usr/bin/env node

const yargs = require('yargs');

// Importing all the commands
const generateCommand = require('../src/commands/generate');
const buildImageCommand = require('../src/commands/buildimage');
const runContCommand = require('../src/commands/runcontainer');
const devModeCommand = require('../src/commands/devMode');
const initCommand = require('../src/commands/init');
const backupCommand = require('../src/commands/backup');
const undoBackupCommand = require('../src/commands/undo');
const deleteBackupsCommand = require('../src/commands/deleteBackups');


// CLI Setup with Yargs
yargs
  .scriptName('dockmate')
  .usage('$0 <cmd> [args]')
  .command(devModeCommand)
  .command(initCommand)
  .command(generateCommand)
  .command(buildImageCommand)
  // this is a function that is not that needed. Cause normal docker run command is much better, just made it to feel satisified
  .command(runContCommand)
  .command(backupCommand)
  .command(undoBackupCommand)
  .command(deleteBackupsCommand)
  .help()
  .argv;
