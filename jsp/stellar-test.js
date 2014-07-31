"use strict";

var isNode = typeof module !== 'undefined' && module.exports;

if (isNode) {
    var System = require('./system.js').System;
    var Units = require('./units.js').Units;
    var BHTree = require('./bhtree.js').BHTree;
    var Stellar = require('./stellar.js').Stellar;
    var _m = require('./math.js')._m;
}

var K2 = Units.K2;
var PI = Math.PI;

var M = 1;
var a = 1;
var max_R = 30*a;

var rng = _m.seededRandom(1234);

var s = Stellar(5e3, function(R) {
    return (3*M/(4*PI*a*a*a) * Math.pow(1+R*R/(a*a), -5./2.));
}, max_R, rng);
var m = s.ith(0)[MASS];




s.eps = Math.pow(4./3. * Math.PI * a * a * a / s.size(), 1./3.);
s.eps_abs = 1e-2;
s.eps_rel = 1e-2;
s.theta = 0.75;
console.log(s.eps);
s.computeForce();
console.log(s.kinetic(), s.potential(), 2*s.kinetic()/s.potential(), s.eps);

console.log(s.eps/Math.sqrt(s.kinetic()));
s.center();

var dt = 1;
var tmax = 1000;
var i = 0;
s.ncols = VZ+1;
while (s.t < tmax) {
    s.computeForce();
    var com = _m.norm(_m.subset(s.centerOfMass(), VX, VZ+1));
    console.log(s.t, 2.*s.kinetic()/s.potential(), s.potential() + s.kinetic(), s.eps, s.dt_avg, com);
    s.center();
    s.writeSync("out_" + i + ".txt");
    
    s.evolve(s.t+dt);
    i++;
}
