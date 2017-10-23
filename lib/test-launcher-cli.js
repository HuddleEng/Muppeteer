#!/usr/bin/env node
const path = require('path');
const Launcher = require('../src/test-launcher');

const argv = require('yargs')
    .usage('Usage: $0 <command> [options]')

    .example('$0 --t example/tests --r example/tests/report', 'Specifies report directory and  report directory')
    .example('$0 --t example/tests --f test.js --r example/tests/report', 'Specifies report directory, filter for file name and report directory')
    .alias('t', 'testDir')
    .describe('t', 'Test directory')
    .demandOption(['t'])
    .alias('f', 'testFilter')
    .describe('f', 'Test filter')
    .alias('r', 'reportDir')
    .describe('r', 'Report directory')
    .demandOption(['r'])
    .help('h')
    .alias('h', 'help')
    .argv;

new Launcher(argv.t, argv.f, argv.r);