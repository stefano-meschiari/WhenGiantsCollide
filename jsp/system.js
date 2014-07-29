"use strict";

if (typeof module !== 'undefined' && module.exports) {
    var BHTree = require("./bhtree.js").BHTree;
    var Units = require("./units.js").Units;
    var _m = require("./math.js")._m;
}

var K2 = Units.K2;

function System(N) {
    this.p = [];
    this.f = [];
    this.changed = false;
    this.Phi = 0.;
    this.theta = 1.;
    this.eps = 1e-6;
    this.abs_acc = 1e-3;
    this.eps_acc = 1e-3;
    this.t = 0;
    
    this.computeGravity = true;

    var i;    
    for (i = 0; i < N; i++) {
        this.p.push(new Float64Array(NCOORDS));
        this.f.push(new Float64Array(NPHYS*2));
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

System.prototype.centerOfMass = function(com) {
    var p = this.p;
    com = com || _m.zeros(7);
    _V(com) = 0.;
    
    for (var i = 0; i < p.length; i++) {
        for (var j = X; j <= VZ; j++) {
            com[j] += p[i][j]*p[i][MASS];
        }
        com[6] += p[i][MASS];
    }
    
    for (i = X; i <= VZ; i++)
        com[i] /= com[6];
    
    return com;
};

System.prototype.evolve = function(to_t, force) {
    force = force || this.computeForce;
    _m.rk23(this.t, this.p, force, to_t, this);
    this.t = to_t;
};

var walker = function(n, p_i, f_i, i, self) {
    var open = false;
    var d2;
    
    if (self.computeGravity) {
        d2 = D2(p_i, n.com);
        if (n.type != BHTree.PARTICLE && (SQR(n.width)/d2 > self.theta2 || CONTAINS(p_i, n.min, n.width))) {
            open = true;
        } else {
            if (n.bodyIndex == i)
                return false;

            var m = n.mass;
            var com = n.com;
            var d = Math.sqrt(d2 + self.eps2);
            var d3 = d*d*d;
            
            f_i[VX] += K2*m * (com[X]-p_i[X])/d3;
            f_i[VY] += K2*m * (com[Y]-p_i[Y])/d3;
            f_i[VZ] += K2*m * (com[Z]-p_i[Z])/d3;

            self.Phi += -K2 * m * p_i[MASS] / d;
        };
    }

    return(open);
};

System.prototype.computeForce = function(t, p, f) {
    t = t || 0;
    p = p || this.p;
    f = f || this.f;
    
    var self = this;
    this.theta2 = SQR(this.theta);
    this.eps2 = SQR(this.eps);
    
    this.tree.update(p);
    this.Phi = 0.;
    var N = this.p.length;
    
    for (var i = 0; i < N; i++) {
        var p_i = p[i];
        var f_i = f[i];
        
        _V(f_i) = 0.;
        f_i[X] = p_i[VX];
        f_i[Y] = p_i[VY];
        f_i[Z] = p_i[VZ];
        
        this.tree.walk(walker, p_i, f_i, i, self);
    };


    
    this.Phi /= 2.;
};



System.prototype.bruteForce = function(t, p, f) {
    this.Phi = 0;
    var eps2 = SQR(this.eps);
    var i, j;
    t = t || 0;
    f = f || this.f;
    p = p || this.p;
    var N = p.length;
    
    for (i = 0; i < N; i++)
        _V(f[i]) = 0;

    
    var dist = 0;
    for (i = 0; i < N; i++) {
        f[i][X] = p[i][VX];
        f[i][Y] = p[i][VY];
        f[i][Z] = p[i][VZ];
        
        for (j = 0; j < N; j++) {
            if (i >= j)
                continue;
            var d = Math.sqrt(D2(p[i], p[j]) + eps2);
            var d3 = d*d*d;
            f[i][VX] += -K2*p[j][MASS] * (p[i][X]-p[j][X])/d3;
            f[i][VY] += -K2*p[j][MASS] * (p[i][Y]-p[j][Y])/d3;
            f[i][VZ] += -K2*p[j][MASS] * (p[i][Z]-p[j][Z])/d3;

            f[j][VX] += K2*p[i][MASS] * (p[i][X]-p[j][X])/d3;
            f[j][VY] += K2*p[i][MASS] * (p[i][Y]-p[j][Y])/d3;
            f[j][VZ] += K2*p[i][MASS] * (p[i][Z]-p[j][Z])/d3;

            this.Phi += -K2*p[i][MASS] * p[j][MASS]/d;

            
        }
    }

    DEBUG((function() { if (_m.isNaN(f)) throw 'f is NaN'; })());    
};

System.prototype.force = function() {
    return this.f;
};

System.prototype.potential = function() {
    return this.Phi;
};

System.prototype.kinetic = function() {
    var K = 0;
    _A(K, this.p) += (SQR($1[VX])+SQR($1[VY])+SQR($1[VZ])) * $1[MASS];
    return 0.5*K;
};

System.prototype.writeSync = function(file) {
    _m.writeMatrixSync(file, this.p);
};

if (typeof(exports) !== 'undefined') {
    exports.System = System;
}

// Local Variables:
// eval: (add-hook 'after-save-hook (lambda() (shell-command "cd ..; make >/dev/null" nil)) nil t)
// End:
