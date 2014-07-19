





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
        
        var theta2 = ((system.theta)*(system.theta));
        var eps2 = ((system.eps)*(system.eps));
        var dist = 0;
        var i;
        Phi = 0.;
        
        for (i = 0; i < N; i++) {
            var p_i = p[i];
            { f[i][0] = 0.; f[i][1] = 0.; f[i][2] = 0.;};
            
            tree.walk(function(n) {
                var open = false;
                
                var d2;
                if (system.computeGravity) {
                    d2 = (((p_i[0]- n.com[0])*(p_i[0]- n.com[0])) + ((p_i[1]- n.com[1])*(p_i[1]- n.com[1])) + ((p_i[2] -  n.com[2])*(p_i[2] -  n.com[2])));
                    dist++;
                    if (((n.width)*(n.width))/d2 > theta2 && n.type != tree.PARTICLE) {
                        open = true;
                    } else {
                        if (n.bodyIndex == i)
                            return false;

                        var m = n.mass;
                        var com = n.com;
                        var d = Math.sqrt(d2 + eps2);
                        var d3 = d*d*d;
                        
                        f[i][0] += -m * (com[0]-p_i[0])/d3;
                        f[i][1] += -m * (com[1]-p_i[1])/d3;
                        f[i][2] += -m * (com[2]-p_i[2])/d3;
                        Phi += -m * p_i[6] / d;
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
        var eps2 = ((system.eps)*(system.eps));
        var i, j;
        for (i = 0; i < N; i++)
            { f[i][0] = 0.; f[i][1] = 0.; f[i][2] = 0.;};
        var dist = 0;
        for (i = 0; i < N; i++) 
            for (j = i+1; j < N; j++) {

                var d = Math.sqrt((((p[i][0]- p[j][0])*(p[i][0]- p[j][0])) + ((p[i][1]- p[j][1])*(p[i][1]- p[j][1])) + ((p[i][2] -  p[j][2])*(p[i][2] -  p[j][2]))) + eps2);
                var d3 = d*d*d;
                f[i][0] += p[j][6] * (p[i][0]-p[j][0])/d3;
                f[i][0] += p[j][6] * (p[i][0]-p[j][0])/d3;
                f[i][0] += p[j][6] * (p[i][0]-p[j][0])/d3;

                f[j][0] += -p[i][6] * (p[i][0]-p[j][0])/d3;
                f[j][1] += -p[i][6] * (p[i][1]-p[j][1])/d3;
                f[j][2] += -p[i][6] * (p[i][2]-p[j][2])/d3;

                Phi += -p[i][6] * p[j][6]/d;
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
        p.push(new Float64Array(10));
        f.push(new Float64Array(3));
    }

    tree = BHTree();
    
    return system;    
});


if (typeof(exports) !== 'undefined') {
    exports.System = system;
} else {
    System = system;
}

