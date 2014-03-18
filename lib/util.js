'use strict';

var thing = require('core-util-is');


exports.slice = Function.prototype.call.bind(Array.prototype.slice);


exports.clone = function clone(src) {
    var dest = src;

    if (thing.isObject(src)) {
        dest = Array.isArray(src) ? [] : Object.create(Object.getPrototypeOf(src));
        Object.getOwnPropertyNames(src).forEach(function (prop) {
            Object.defineProperty(dest, prop, Object.getOwnPropertyDescriptor(src, prop));
        });
    }

    return dest;
};


exports.peek = function peek(arr) {
    if (Array.isArray(arr)) {
        return arr[arr.length - 1];
    }
    return undefined;
};


exports.createKey = function createKey(exists) {
    var index, key;

    index = 1;
    do {
        key = 'e' + index;
        index += 1;
    } while (exists(key));

    return key;
};
