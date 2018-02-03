/**
 *
 * This file contains functions taken, and sometimes modified, from the PhantomJS repository, under BSD-3-Clause licence
 * https://github.com/ariya/phantomjs/blob/master/LICENSE.BSD
 *
 * The following copyright notice(s) apply:
 *
 * Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>
 * Copyright (C) 2011 Ivan De Marino <ivan.de.marino@gmail.com>
 * Copyright (C) 2011 James Roe <roejames12@hotmail.com>
 * Copyright (C) 2011 execjosh, http://execjosh.blogspot.com
 * Copyright (C) 2012 James M. Greene <james.m.greene@gmail.com>
**/

// Source: https://github.com/ariya/phantomjs/blob/master/src/modules/webpage.js#L205
const detectType = value => {
    let s = typeof value;
    if (s === 'object') {
        if (value) {
            if (value instanceof Array) {
                s = 'array';
            } else if (value instanceof RegExp) {
                s = 'regexp';
            } else if (value instanceof Date) {
                s = 'date';
            }
        } else {
            s = 'null';
        }
    }
    return s;
};

// Source: https://github.com/ariya/phantomjs/blob/master/src/modules/webpage.js#L167
const quoteString = str => {
    let c, i, l = str.length, o = '"';
    for (i = 0; i < l; i += 1) {
        c = str.charAt(i);
        if (c >= ' ') {
            if (c === '\\' || c === '"') {
                o += '\\';
            }
            o += c;
        } else {
            switch (c) {
                case '\b':
                    o += '\\b';
                    break;
                case '\f':
                    o += '\\f';
                    break;
                case '\n':
                    o += '\\n';
                    break;
                case '\r':
                    o += '\\r';
                    break;
                case '\t':
                    o += '\\t';
                    break;
                default:
                    c = c.charCodeAt();
                    o += '\\u00' + Math.floor(c / 16).toString(16) +
                        (c % 16).toString(16);
            }
        }
    }
    return o + '"';
};

// Source: from https://github.com/ariya/phantomjs/blob/master/src/modules/webpage.js#L354-L388
module.exports = function serializeFunctionWithArgs(fn, ...args) {
    if (!(fn instanceof Function || typeof fn === 'string' || fn instanceof String)) {
        throw Error('Wrong use of evaluate');
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
};



