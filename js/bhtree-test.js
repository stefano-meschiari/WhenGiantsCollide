_ = require('underscore');

var BHTree = require('./bhtree.js').BHTree;
var System = require('./system.js').System;

var X = 0;
var Y = 1;
var Z = 2;
var MASS = 6;

var N = 10000;
var s = new System(N);

for (var i = 0; i < N; i++) {
    var ith = s.ith(i);
    ith[X] = Math.random();
    ith[Y] = Math.random();
    ith[Z] = Math.random();
    ith[MASS] = Math.random();
}

console.log(s.bruteForce());
phi = s.potential();
console.log(phi);

console.log(s.computeForce());
phi = s.potential();
console.log(phi);
