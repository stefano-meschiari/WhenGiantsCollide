var isNode = typeof module !== 'undefined' && module.exports;

if (isNode) {
    var System = require('./system.js').System;
    var BHTree = require('./bhtree.js').BHTree;
    var _m = require('./math.js')._m;
}

var s = new System(4096), i;
var M = 1.;
var R = 1.;
var m = M/s.size();

var v3 = _m.zeros(3);

for (i = 0; i < s.size(); i++) {
    var p = s.ith(i);
    _m.sphereRandom(v3);
    var norm = _m.norm(v3);
    var r = Math.pow(Math.random() * R*R*R, 1./3.);
    _V(v3) /= (norm / r);
    _V(p, v3) = $1;
}

s.writeSync('out.txt');
