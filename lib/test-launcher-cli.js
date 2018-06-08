#!/usr/bin/env node

/**
 *
 * This file represents the CLI test launcher. It allows one to configure and run tests via a CLI interface.
 * This allows the end user to run the tests via npm scripts and similar
 *
 * */

const ConfigureLauncher = require('./test-launcher');

const { argv } = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .example(
        '$0 --p example/tests --r example/tests/report',
        'Specifies report directory and report directory'
    )
    .example(
        '$0 --p example/tests/*.test.js -r example/tests/report',
        'Specifies report directory, filter for file name and report directory'
    )
    .example(
        '$0 --p example/tests/*.test.js --r example/tests/report --h false --s true',
        'Specifies report directory, filter for file name and report directory with GUI'
    )
    .option('testPathPattern', {
        alias: 'p'
    })
    .option('testDir', {
        alias: 't'
    })
    .option('testFilter', {
        alias: 'f',
        default: null
    })
    .option('reportDir', {
        alias: 'r'
    })
    .demandOption(['r'])
    .option('visualThreshold', {
        alias: 'v',
        default: 0.05
    })
    .option('shouldRebaseVisuals', {
        alias: 'b',
        type: 'boolean',
        default: false
    })
    .option('headless', {
        alias: 'h',
        type: 'boolean',
        default: true
    })
    .option('disableSandbox', {
        alias: 's',
        type: 'boolean',
        default: false
    })
    .option('executablePath', {
        alias: 'e',
        default: null
    })
    .option('useDocker', {
        alias: 'd',
        type: 'boolean',
        default: true
    })
    .option('dockerChromeVersion', {
        alias: 'c',
        default: null
    });

ConfigureLauncher({
    testPathPattern: argv.p,
    testDir: argv.t,
    testFilter: argv.f,
    reportDir: argv.r,
    visualThreshold: argv.v,
    shouldRebaseVisuals: argv.b,
    headless: argv.h,
    disableSandbox: argv.s,
    executablePath: argv.e,
    useDocker: argv.d,
    dockerChromeVersion: argv.c
}).launch();
