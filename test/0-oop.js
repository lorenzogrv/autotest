var assert = require('assert');

var iai = require('..');
assert(
    iai.oop === require('iai-oop'),
    'oop namespace should store the iai-oop module api'
);

iai.oop = null;
assert(
    iai.oop === require('iai-oop'),
    'oop namespace should be non-writable'
);

delete iai.oop;
assert(
    iai.oop === require('iai-oop'),
    'oop namespace should be non-configurable'
);
