const { promisify } = require('util');
const extract = promisify(require('extract-zip'));
const path = require('path');
const { CONSOLE_PREFIX } = require('../src/console-helpers');
const { checkDependencies } = require('../src/check-dependencies');

const file = 'todomvc-react.zip';
const targetDir = path.join(__dirname, 'e2e');
const source = path.join(targetDir, file);

(async () => {
    console.log(`${CONSOLE_PREFIX} Running post-setup script...`.green);
    const extractErrors = await extract(source, { dir: targetDir });

    if (!extractErrors) {
        checkDependencies();
        console.log(`${CONSOLE_PREFIX} Post-setup script complete`.green);
    } else {
        throw Error(`${CONSOLE_PREFIX} Unable to extract ${file}`.red);
    }
})();
