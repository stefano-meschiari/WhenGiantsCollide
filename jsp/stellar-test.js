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
var max_R = 5*a;

Stellar(1000, function(R) {
    return (3*M/(4*PI*a*a*a) * Math.pow(1+R*R/(a*a), -5./2.));
}, max_R);