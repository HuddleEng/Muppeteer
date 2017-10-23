const path = require('path');
const Launcher = require('../lib/test-launcher');
const testDir = path.join(__dirname, './tests');
const testFilter = 'test.js';
const testReportDir = path.join(__dirname, './tests/report');

new Launcher(testDir, testFilter, testReportDir);