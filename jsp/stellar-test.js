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

var s = Stellar(1e3, function(R) {
    return (3*M/(4*PI*a*a*a) * Math.pow(1+R*R/(a*a), -5./2.));
}, max_R, rng);

s.writeSync("out.txt");
s.computeForce();
s.eps = Math.pow(4./3. * a / s.size(), 1./3.);
s.eps_acc = 1e-2;
s.eps_rel = 1e-2;

console.log(s.kinetic(), s.potential(), 2*s.kinetic()/s.potential(), s.eps);
console.log(s.eps/Math.sqrt(s.kinetic()));
var dt = 1;
var tmax = 10;
var i = 0;
while (s.t < tmax) {
    s.computeForce();
    var dt_h = 1e20;
    var f = s.force();

    _m.logerr = true;
    console.log(0.25*dt_h);
    
    console.log(s.t, 2.*s.kinetic()/s.potential(), s.potential() + s.kinetic(), s.eps, s.dt_avg);
    s.writeSync("out_" + i + ".txt");

//    _m.logerr = true;
    
    s.evolve(s.t+dt);
    i++;
}
