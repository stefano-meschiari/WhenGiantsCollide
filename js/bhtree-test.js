_ = require('underscore');

benchmark = function(Nb, fun) {
    var d = +(new Date());
    for (var i = 0; i < Nb-1; i++)
        fun();
    console.log(fun());
    return (+(new Date())-d)/Nb;
};

var BHTree = require('./bhtree.js').BHTree;
var System = require('./system.js').System;

for (var i = 1; i < 4; i++) {
    var N = 1000 * i;
    var system = System();
    system.init(N, 1, 0, 0, 1, 1, 0);
    var pa = system.particles();

    var tree = BHTree();
    tree.init(pa);
    console.log(i);
    var t = benchmark(100, function() {
        var p =[];
        for (var i = 0; i < N; i++) {
            p.push(tree.neighborsWithin(pa[i], 2e-4/Math.pow(i, 1./4.)));
        }
    });
    
    if (i == 1)
        t0 = t;
    console.log(N, t, t/t0, t/t0 / (N*Math.log(N)), tree.size());
}

