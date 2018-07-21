const path = require('path');
const glob = require('glob');
const recursiveReadSync = require('recursive-readdir-sync');

module.exports = {
    // new fancy way of file path matching
    globMatch: testPathPattern => {
        try {
            return glob.sync(testPathPattern, {});
        } catch (err) {
            throw Error(err);
        }
    },
    // legacy/old way of file path matching using a separate directory and file filter
    legacyMatch: (testDir, testFilter) => {
        let files = [];

        try {
            files = recursiveReadSync(testDir);
        } catch (err) {
            if (err.errno === 34) {
                throw Error('Path does not exist');
            } else {
                throw err;
            }
        }

        return files.filter(
            file =>
                (testFilter instanceof RegExp &&
                    testFilter.test(path.basename(file))) ||
                path.basename(file).indexOf(testFilter || '.test.js') !== -1
        );
    }
};
