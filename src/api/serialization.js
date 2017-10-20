const {detectType, quoteString} = require('../test-utils');

module.exports = {
    // Taken and modified from: from https://github.com/ariya/phantomjs/blob/master/src/modules/webpage.js#L354-L388
    serializeFunctionWithArgs(fn, ...args) {
        if (!(fn instanceof Function || typeof fn === 'string' || fn instanceof String)) {
            throw new Error('Wrong use of evaluate');
        }

        let str = '(function() { return (' + fn.toString() + ')(';

        args.forEach(arg => {
            let argType = detectType(arg);

            switch (argType) {
                case 'object':      //< for type "object"
                case 'array':       //< for type "array"
                    str += JSON.stringify(arg) + ',';
                    break;
                case 'date':        //< for type "date"
                    str += 'new Date(' + JSON.stringify(arg) + '),';
                    break;
                case 'string':      //< for type "string"
                    str += quoteString(arg) + ',';
                    break;
                default:            // for types: "null", "number", "function", "regexp", "undefined"
                    str += arg + ',';
                    break;
            }
        });

        return str.replace(/,$/, '') + '); })()';
    },
};


