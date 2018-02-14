const {promisify} = require('util');
const extract = promisify(require('extract-zip'));
const path = require('path');

const file = 'todomvc-react.zip';
const source = path.join(__dirname, file);

(async() => {
    const extractErrors = await extract(source, { dir: __dirname });
    
    if (!extractErrors) {
        console.log('Post-setup script complete');
    } else {
        throw Error(`Unable to extract ${file}`);
    }
})();