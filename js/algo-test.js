_ = require('underscore');
var algo = require('./algo-prod.js');
var X = 0;
var Y = 1;
var Z = 2;


for (var i = 1; i < 4; i++) {
    var N = 1000 * i;
    algo.SYSTEM.init(N, 1, 0, algo.x1, algo.x2, algo.R1, algo.R2);
    var pa = algo.SYSTEM.particles();
    algo.BHTREE.init(pa);
    console.log(i);
    var t = _.benchmark(100, function() {
        var p =[];
        for (var i = 0; i < N; i++) {
            p.push(algo.BHTREE.neighborsWithin(pa[i], 2e-4/Math.pow(i, 1./4.)));
        }        
    });
    
    if (i == 1)
        t0 = t;
    console.log(N, t, t/t0, t/t0 / (N*Math.log(N)), algo.BHTREE.size());
    
}

