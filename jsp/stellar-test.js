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

var s = Stellar(200, function(R) {
    return (3*M/(4*PI*a*a*a) * Math.pow(1+R*R/(a*a), -5./2.));
}, max_R, rng);
var m = s.ith(0)[MASS];

s.eps = Math.pow(4./3. * Math.PI * a * a * a / s.size(), 1./3.);
s.eps_abs = 3e-2;
s.eps_rel = 3e-2;
s.theta = 0.75;
console.log(s.eps);
s.countForce = true;
s.computeForce();
var brute = s.size()*(s.size()-1)/2;
console.error(s.forceCounter1, s.forceCounter2, brute, s.forceCounter1/brute, s.forceCounter2/brute);
console.log(s.kinetic(), s.potential(), 2*s.kinetic()/s.potential(), s.eps);

console.log(s.eps/Math.sqrt(s.kinetic()));
s.center();

var dt = 0.1;
var tmax = 2;
var i = 0;
s.ncols = VZ+1;
s.useTimeStep_control = true;
while (s.t < tmax) {
    s.computeForce();
    var com = _m.norm(_m.subset(s.centerOfMass(), VX, VZ+1));
    console.log(s.t, 2.*s.kinetic()/s.potential(), s.potential() + s.kinetic(), s.eps, s.dt_avg, com);
    s.center();
    s.writeSync("out_" + i + ".txt");
    
    s.evolve(s.t+dt);
    i++;
}
