const Mocha = require('mocha');
const path = require('path');
const mochateerInterface = require('../lib/test-interface');
const {browserInstance} = require('../lib/test-controller');
const recursiveReadSync = require('recursive-readdir-sync');

Mocha.interfaces['mochateer'] = mochateerInterface(component => {
    return component.url;
}, component => {
    return path.join(__dirname, `./tests/screenshots/${component.name}`);
});

(async function() {
    const mocha = new Mocha({timeout: 10000, ui: 'mochateer'});

    let files = null;

    try {
        files = recursiveReadSync('./example/tests');
    } catch (err){
        if (err.errno === 34){
            console.log('Path does not exist');
        } else {
            throw err;
        }
    }

    files.filter(file => {
        return path.basename(file).substr(-7) === 'test.js';
    }).forEach(file =>  {
        const fullPath = path.join(__dirname, '../', file);
        mocha.addFile(fullPath);
    });

    mocha.run(function(failures) {
        browserInstance.closeBrowser();
        if (failures) {
            console.err(failures);
        }
    });
})();

