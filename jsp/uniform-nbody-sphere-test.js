"use strict";

var isNode = typeof module !== 'undefined' && module.exports;

if (isNode) {
    var System = require('./system.js');
    var K2 = System.K2;
    System = System.System;
    var BHTree = require('./bhtree.js').BHTree;
    var _m = require('./math.js')._m;
}


var s = new System(2), i;
var M = 1.;
var R = 1.;
var m = M/s.size();

var v3 = _m.zeros(3);
var sigma = _m.zeros(1);

for (i = 0; i < s.size(); i++) {
    var p = s.ith(i);
    p[MASS] = m;
    
    _m.sphereRandom(v3);
    var norm = _m.norm(v3);
    var r = Math.pow(Math.random() * R*R*R, 1./3.);
    _V(p, v3) = $1 * r / norm;
    
    // d\sigma^2 / dr = -GM(r)/r^2 = -G M_T/R_T^3 R

    _m.gaussianRandom(sigma, 0., Math.sqrt(K2*M/(R*R*R) * (r*r)));

    _m.sphereRandom(v3);
    norm = _m.norm(v3);
    _V(v3) /= norm;
    
    p[VX] = sigma[0] * v3[X];
    p[VY] = sigma[0] * v3[Y];
    p[VZ] = sigma[0] * v3[Z];    
}

p = s.p;
_V(p[0]) = 0.;
p[0][MASS] = 1;
_V(p[1]) = 0.;
p[1][X] = 1;
p[1][VY] = Math.sqrt(K2);
p[1][MASS] = 0.0001;

console.log(2*Math.PI/p[1][VY]);

s.abs_acc = s.rel_acc = 1e-13;
s.centerOfMass();
console.log(MASS);

s.computeForce();
var E = s.kinetic() + s.potential();

for (var t = 20; t < 100; t += 20) {
    
    s.evolve(t);
    var com = s.centerOfMass();
    var v = Math.sqrt(SQR(com[X])+SQR(com[Y])+SQR(com[Z]));
    console.log(s.t, s.dt, 2.*s.kinetic()/s.potential(), (s.kinetic() + s.potential())/E, v, com[6]);
}

s.computeForce();
console.log(s.t, s.dt, 2.*s.kinetic()/s.potential());


// Local Variables:
// eval: (add-hook 'after-save-hook (lambda() (shell-command "cd ..; make >/dev/null")) nil t)
// End:

