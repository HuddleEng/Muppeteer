#!/usr/bin/env node
const path = require('path');
const Launcher = require('../src/test-launcher');

const argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .example('$0 --t example/tests --r example/tests/report', 'Specifies report directory and report directory')
    .example('$0 --t example/tests --f test.js --r example/tests/report', 'Specifies report directory, filter for file name and report directory')
    .option('testDir', {
        alias: 't',
    })
    .demandOption(['t'])
    .option('testFilter', {
        alias: 'f',
        default: null
    })
    .option('reportDir', {
        alias: 'r',
    })
    .demandOption(['r'])
    .option('visualThreshold', {
        alias: 'v',
        default: 0.05
    })
    .argv;

new Launcher({
        testDir: argv.t,
        testFilter: argv.f,
        reportDir: argv.r,
        visualThreshold: argv.v
    }
);