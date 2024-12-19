#!/usr/bin/env node

const yargs = require('yargs'); // CLI argument parser
const { hideBin } = require('yargs/helpers'); // For parsing arguments from process.argv
const { generateDockerfile } = require('../src/dockerfile-generator');

// Define CLI commands and options
yargs(hideBin(process.argv))
  .scriptName('dockgen') // CLI tool name
  .usage('$0 <cmd> [args]') // General usage description
  .command(
    'generate',
    'Generate Dockerfile for the project',
    (yargs) => {
      yargs
        .option('framework', {
          describe: 'Specify framework for the Dockerfile',
          choices: ['node'],
          demandOption: true,
        })
        .option('nodeVersion', {
          describe: 'Specify the Node.js version',
          default: '18', // Default Node.js version
        })
        .option('port', {
          describe: 'Application port to expose',
          default: 3000, // Default port number
        })
        .option('entryPoint', {
          describe: 'Entry point of the application',
          default: 'index.js', // Default application entry point
        });
    },
    async (argv) => {
      const framework = argv.framework;
      console.log(`Generating Dockerfile for ${framework}...`);

      try {
        await generateDockerfile(framework, {
          nodeVersion: argv.nodeVersion,
          port: argv.port,
          entryPoint: argv.entryPoint,
        });
        console.log('Dockerfile generated successfully!');
      } catch (err) {
        console.error('Error:', err.message);
      }
    }
  )
  .help() // Add help command and descriptions
  .alias('help', 'h') // Allow "-h" as a shortcut for help
  .argv;
