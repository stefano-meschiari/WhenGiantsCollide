"use strict";

if (typeof module !== 'undefined' && module.exports) {
    var _ = require('underscore');
    var BHTree = require('./bhtree.js').BHTree;
    var System = require('./system.js').System;
} else {
    importScripts("./bhtree.js?v=0", "./system.js?v=0", "http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min.js");
}

if (typeof postMessage == 'undefined') {
    var postMessage = function() { };
}
if (!(this.console && this.console.log)) {
    this.console = { log: function() {} };
}

function benchmark(f, N) {
    var d = new Date();
    for (var i = 0; i < N; i++)
        f();
    return((new Date()-d)/N);
}

var X = 0;
var Y = 1;
var Z = 2;
var MASS = 6;

var NB = 10;

var NN = _.map(_.range(6, 15), _.partial(Math.pow, 2));
var results = [];
var s;
_.each(NN, function(N) {
    s = System(N);

    for (var i = 0; i < N; i++) {
        var ith = s.ith(i);
        ith[X] = Math.random();
        ith[Y] = Math.random();
        ith[Z] = Math.random();
        ith[MASS] = Math.random();
    }

    var brute_force = benchmark(function() {
        s.bruteForce();
    }, NB);

    var tree_force = benchmark(function() {
        s.computeForce();
    }, NB);

    results.push([N, brute_force, tree_force, NN.length]);
    postMessage(results);
});

var score = benchmark(function() {
    s.computeForce();
}, NB);

postMessage(["score", (score * 100)|0]);
console.log((score*100)|0);
