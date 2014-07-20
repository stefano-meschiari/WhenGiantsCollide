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
        this.p.push(new Float64Array(NCOORDS));
        this.f.push(new Float64Array(NPHYS));
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
    var theta2 = SQR(this.theta);
    var eps2 = SQR(this.eps);

    var walker = function(n, p_i) {
        var open = false;

        var d2;
        
        if (self.computeGravity) {
            d2 = D2(p_i, n.com);
            if (n.type != BHTree.PARTICLE && SQR(n.width)/d2 > theta2) {
                open = true;
            } else {
                if (n.bodyIndex == i)
                    return false;

                var m = n.mass;
                var com = n.com;
                var d = Math.sqrt(d2 + eps2);
                var d3 = d*d*d;
                
                self.f[i][X] += -m * (com[X]-p_i[X])/d3;
                self.f[i][Y] += -m * (com[Y]-p_i[Y])/d3;
                self.f[i][Z] += -m * (com[Z]-p_i[Z])/d3;
                self.Phi += -m * p_i[MASS] / d;
            };
        }
        return(open);
    };
    
    this.tree.update(this.p);
    this.Phi = 0.;
    var N = this.p.length;
    
    for (var i = 0; i < N; i++) {
        var p_i = this.p[i];
        VZERO(this.f[i]);
        
        this.tree.walk(walker, p_i);
    };


    this.Phi /= 2.;
};

System.prototype.bruteForce = function() {
    this.Phi = 0;
    var eps2 = SQR(this.eps);
    var i, j;
    var f = this.f;
    var p = this.p;
    var N = p.length;
    
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

            this.Phi += -p[i][MASS] * p[j][MASS]/d;
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
