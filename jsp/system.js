"use strict";

if (typeof module !== 'undefined' && module.exports) {
    var BHTree = require("./bhtree.js").BHTree;
}

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

var system = (function(N) {
    var system = {};
    
    var p = [];
    var f = [];
    var tree;
    var changed = false;
    var Phi = 0.;
    
    system.ith = function(i) {
        return p[i];
    };

    system.coords = function() {
        var c = [];
        for (i = 0; i < N; i++)
            c.push(new Float64Array(p[i]));
        return c;
    };
    
    system.size = function() {
        return N;
    };

    system.theta = 1.;
    system.eps = 1e-8*RUNIT;

    system.computeGravity = true;
    
    system.computeForce = function() {
        tree.update(p);
        
        var theta2 = SQR(system.theta);
        var eps2 = SQR(system.eps);
        var dist = 0;
        var i;
        Phi = 0.;
        
        for (i = 0; i < N; i++) {
            var p_i = p[i];
            VZERO(f[i]);
            
            tree.walk(function(n) {
                var open = false;
                
                var d2;
                if (system.computeGravity) {
                    d2 = D2(p_i, n.com);
                    dist++;
                    if (SQR(n.width)/d2 > theta2 && n.type != tree.PARTICLE) {
                        open = true;
                    } else {
                        if (n.bodyIndex == i)
                            return false;

                        var m = n.mass;
                        var com = n.com;
                        var d = Math.sqrt(d2 + eps2);
                        var d3 = d*d*d;
                        
                        f[i][X] += -m * (com[X]-p_i[X])/d3;
                        f[i][Y] += -m * (com[Y]-p_i[Y])/d3;
                        f[i][Z] += -m * (com[Z]-p_i[Z])/d3;
                        Phi += -m * p_i[MASS] / d;
                    };
                }
                return(open);
            });
        };


        Phi /= 2.;
        return(dist);
    };

    system.bruteForce = function() {
        Phi = 0;
        var eps2 = SQR(system.eps);
        var i, j;
        for (i = 0; i < N; i++)
            VZERO(f[i]);
        var dist = 0;
        for (i = 0; i < N; i++) 
            for (j = i+1; j < N; j++) {

                var d = Math.sqrt(D2(p[i], p[j]) + eps2);
                var d3 = d*d*d;
                f[i][X] += p[j][MASS] * (p[i][X]-p[j][X])/d3;
                f[i][X] += p[j][MASS] * (p[i][X]-p[j][X])/d3;
                f[i][X] += p[j][MASS] * (p[i][X]-p[j][X])/d3;

                f[j][X] += -p[i][MASS] * (p[i][X]-p[j][X])/d3;
                f[j][Y] += -p[i][MASS] * (p[i][Y]-p[j][Y])/d3;
                f[j][Z] += -p[i][MASS] * (p[i][Z]-p[j][Z])/d3;

                Phi += -p[i][MASS] * p[j][MASS]/d;
                dist++;
            }
        return(dist);
    };

    system.force = function() {
        return f;
    };

    system.potential = function() {
        return Phi;
    };
    
    var i;    
    for (i = 0; i < N; i++) {
        p.push(new Float64Array(NCOORDS));
        f.push(new Float64Array(NPHYS));
    }

    tree = BHTree();
    
    return system;    
});


if (typeof(exports) !== 'undefined') {
    exports.System = system;
} else {
    System = system;
}
