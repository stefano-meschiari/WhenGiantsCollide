





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

function System(N) {
    this.p = [];
    this.f = [];
    this.changed = false;
    this.Phi = 0.;
    this.theta = 1.;
    this.eps = 1e-8*RUNIT;

    this.computeGravity = true;

    var i;    
    for (i = 0; i < N; i++) {
        this.p.push(new Float64Array(10));
        this.f.push(new Float64Array(3));
    }

    this.tree = new BHTree();
}

System.prototype.ith = function(i) {
    return this.p[i];
};

System.prototype.coords = function() {
    return this.p;
};

System.prototype.size = function() {
    return this.p.length;
};

System.prototype._walker = function(n, p_i) {

};

System.prototype.computeForce = function() {
    var self = this;
    var theta2 = ((this.theta)*(this.theta));
    var eps2 = ((this.eps)*(this.eps));

    var walker = function(n, p_i) {
        var open = false;

        var d2;
        
        if (self.computeGravity) {
            d2 = (((p_i[0]- n.com[0])*(p_i[0]- n.com[0])) + ((p_i[1]- n.com[1])*(p_i[1]- n.com[1])) + ((p_i[2] -  n.com[2])*(p_i[2] -  n.com[2])));
            if (n.type != BHTree.PARTICLE && ((n.width)*(n.width))/d2 > theta2) {
                open = true;
            } else {
                if (n.bodyIndex == i)
                    return false;

                var m = n.mass;
                var com = n.com;
                var d = Math.sqrt(d2 + eps2);
                var d3 = d*d*d;
                
                self.f[i][0] += -m * (com[0]-p_i[0])/d3;
                self.f[i][1] += -m * (com[1]-p_i[1])/d3;
                self.f[i][2] += -m * (com[2]-p_i[2])/d3;
                self.Phi += -m * p_i[6] / d;
            };
        }
        return(open);
    };
    
    this.tree.update(this.p);
    this.Phi = 0.;
    var N = this.p.length;
    
    for (var i = 0; i < N; i++) {
        var p_i = this.p[i];
        { this.f[i][0] = 0.; this.f[i][1] = 0.; this.f[i][2] = 0.;};
        
        this.tree.walk(walker, p_i);
    };


    this.Phi /= 2.;
};

System.prototype.bruteForce = function() {
    this.Phi = 0;
    var eps2 = ((this.eps)*(this.eps));
    var i, j;
    var f = this.f;
    var p = this.p;
    var N = p.length;
    
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

            this.Phi += -p[i][6] * p[j][6]/d;
        }
};

System.prototype.force = function() {
    return this.f;
};

System.prototype.potential = function() {
    return this.Phi;
};

if (typeof(exports) !== 'undefined') {
    exports.System = System;
} else {
    this.System = System;
}

