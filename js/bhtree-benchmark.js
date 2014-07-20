"use strict";

var isNode = typeof module !== 'undefined' && module.exports;

if (isNode) {
    var _ = require('underscore');
    var BHTree = require('./bhtree.js').BHTree;
    var System = require('./system.js').System;
} else {
    importScripts("bhtree.js?v=1", "system.js?v=1", "vendor/underscore-min.js");
}

if (!(this.console && this.console.log)) {
    this.console = { log: function() {} };
}

var doWork = function(self) {
    function benchmark(f, N) {
        var d = new Date();
        
        for (var i = 0; i < N; i++) 
                f();
        return (new Date()-d)/N;
    }

    function system(N) {
        var s = new System(N);
        for (var i = 0; i < N; i++) {
            var ith = s.ith(i);
            ith[X] = Math.random();
            ith[Y] = Math.random();
            ith[Z] = Math.random();
            ith[MASS] = Math.random();
        }
        return s;
    }

    var X = 0;
    var Y = 1;
    var Z = 2;
    var MASS = 6;

    var NB = 12;

    var NN = _.map(_.range(6, 14), _.partial(Math.pow, 2));
    var results = [];
    var s;
    _.each(NN, function(N) {
        s = system(N);


        var brute_force = benchmark(function() {
            s.bruteForce();
        }, NB);

        var tree_force = benchmark(function() {
            s.computeForce();
        }, NB);

        results.push([N, brute_force, tree_force, NN.length]);
        if (!isNode)
            postMessage(results);
        else
            console.log(N, brute_force, tree_force);
    });

    s = system(16384);
    
    var score = (benchmark(function() {
        s.computeForce();
    }, NB, 10) * 100)|0;

    
    if (!isNode) {
        postMessage(["score", score]);
    }
    console.log(score);
};

if (isNode)
    doWork(null);
else
    self.addEventListener('message', function() { doWork(self); }, false);
