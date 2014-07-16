"use strict";

var AU = 1.4959787e13;
var MSUN = 1.98892e33;
var MJUP = 1.8986e30;
var MEARTH = 5.97219e27;
var RJUP = 7.1e9;
var RSUN = 6.96e10;
var REARTH = 6.3e8;

var GGRAV = 6.67384e-8;
var MIN_DISTANCE = 300 * RJUP/AU;

var DAY = 8.64e4;
var TWOPI = 6.2831853072e+00;
var SQRT_TWOPI = 2.5066282746e+00;
var K2  = ((GGRAV * MSUN * DAY * DAY) / (AU*AU*AU));
var YEAR = 31556926.;


var RUNIT = AU;
var MUNIT = MSUN;
var TUNIT = DAY;

// Simulation parameters

var x1 = 0;
var x2 = 100 * RJUP/RUNIT;
var R1 = RJUP/RUNIT;
var R2 = 0.5 * RJUP/RUNIT;


var System = (function() {
    var system = {};
    
    var com = new Float64Array(NCOORDS);
    var p = [];
    var f = [];
    var f1 = [];
    

    var grid;
    var gridn = 100;
    var force;

    system.init = function(N, M1, M2, x1, x2, R1, R2) {
        var i;
        
        for (i = 0; i < N; i++)
            p.push(new Float64Array(NCOORDS));

        force = new Float64Array(NCOORDS);
        
        // Use M1/(M1+M2) particles for the first planet
        var N1 = (M1/(M1+M2) * N)|0;
        for (i = 0; i < N1; i++) {
            p[i][BODY] = 0;
            p[i][X] = Math.random() * R1 + x1;
            p[i][Y] = Math.random() * R1;
            p[i][Z] = Math.random() * R1;
            p[i][MASS] = M1/N1;
        }

        
        for (i = N1; i < N; i++)
            p[i][BODY] = 1;

        LOG(N1);
        LOG(N);
    };

    system.particles = function() {
        return p;
    };

    system.n2d = function() {
        var d = 0.1 * R1;
        var d2 = d*d;
        var i, j;
        var neighs = 0;
        for (i = 0; i < p.length; i++)
            for (j = 0; j < p.length; j++)
        {};
    };
    
    return system;
    
});


if (typeof(exports) !== 'undefined') {
    exports.System = System;
    exports.R1 = R1;
    exports.R2 = R2;
    exports.x1 = x1;
    exports.x2 = x2;
}
