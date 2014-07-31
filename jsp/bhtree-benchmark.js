"use strict";

var isNode = typeof module !== 'undefined' && module.exports;

if (isNode) {
    var _ = require('underscore');
    var _m = require('./math.js')._m;
    var Units = require('./units.js').Units;
    var BHTree = require('./bhtree.js').BHTree;
    var System = require('./system.js').System;
} else {
    importScripts("math.js?v=1", "units.js?v=1", "bhtree.js?v=1", "system.js?v=1", "vendor/underscore-min.js");
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

    var NB = 12;

    var NN = _.map(_.range(6, 14), _.partial(Math.pow, 2));
    var results = [];
    var s;
    _.each(NN, function(N) {
        s = system(N);


        var brute_force = benchmark(function() {
            s.bruteForce();
        }, NB);

        var Phi_brute = s.Phi;
        
        var tree_force = benchmark(function() {
            s.computeForce();
        }, NB);

        results.push([N, brute_force, tree_force, NN.length]);
        if (!isNode)
            postMessage(results);
        else
            console.log(N, brute_force, tree_force, s.Phi, Phi_brute);
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
