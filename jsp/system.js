"use strict";

if (typeof module !== 'undefined' && module.exports) {
    var BHTree = require("./bhtree.js").BHTree;
    var Units = require("./units.js").Units;
    var _m = require("./math.js")._m;
    var _ = require('underscore');    
}

ASSERT(BHTree);
ASSERT(Units);
ASSERT(_m);
ASSERT(_);

function System(N) {
    this.p = [];
    this.f = [];
    this.changed = false;
    this.Phi = 0.;
    this.theta = 1.;
    this.eps = 1e-6;
    this.eps_abs = 1e-3;
    this.eps_rel = 1e-3;
    this.eps_control = 0.25;
    this.t = 0;
    
    this.computeGravity = true;

    var i;    
    for (i = 0; i < N; i++) {
        this.p.push(new DOUBLEARRAY(NCOORDS));
        this.f.push(new DOUBLEARRAY(NPHYS*2));
    }

    this.tree = new BHTree();
}

System.unserialize = function(data) {
    var s = new System(1);
    var props = ['p', 'f', 'Phi', 'theta', 'eps', 'eps_abs', 'eps_rel', 't', 'theta', 'computeGravity'];
    
    for (var i = 0; i < props.length; i++)
        s[props[i]] = data[props[i]];
    return s;
};

System.prototype.ith = function(i) {
    return this.p[i];
};

System.prototype.coords = function() {
    return this.p;
};

System.prototype.size = function() {
    return this.p.length;
};



System.prototype.centerOfMass = function(com, tag) {
    tag = (tag === undefined ? -1 : tag);
    var p = this.p;
    com = com || _m.zeros(7);
    _V(com) = 0.;
    
    for (var i = 0; i < p.length; i++) {
        if (tag >= 0 && p[i][TAG] != tag) continue;
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
    _m.rk(this.t, this.p, force, to_t, this);
    this.t = to_t;
};

System.walker = function(n, p_i, f_i, i, self) {
    var open = false;
    var d2;
    
    if (self.computeGravity) {
        var com = n.com;
        var dix = com[X]-p_i[X];
        var diy = com[Y]-p_i[Y];
        var diz = com[Z]-p_i[Z];

        d2 = SQR(dix)+SQR(diy)+SQR(diz);
        
        if (n.type != BHTree.PARTICLE && (SQR(n.width)/d2 > self.theta2 || CONTAINS(p_i, n.min, n.width))) {
            open = true;
        } else {
            if (n.bodyIndex == i)
                return false;

            var m = Units.K2*n.mass;
            var d = Math.sqrt(d2 + self.eps2);
            var m_d3 = m/(d*d*d);
            
            f_i[VX] += m_d3 * dix;
            f_i[VY] += m_d3 * diy;
            f_i[VZ] += m_d3 * diz;
            
            self.Phi += -m * p_i[MASS] / d;
            self.timeStep_control = Math.min(self.timeStep_control, 1./(m_d3));
        };
    }

    return(open);
};

System.prototype.computeForce = function(t, p, f, self) {
    t = t || 0;
    p = p || this.p;
    f = f || this.f;
    self = self || this;

    var walker = System.walker;
    this.theta2 = SQR(this.theta);
    this.eps2 = SQR(this.eps);
    this.timeStep_control = 1e20;
    this.tree.update(p);
    this.Phi = 0.;
    var N = this.p.length;
    
    for (var i = 0; i < N; i++) {
        var p_i = p[i];
        var f_i = f[i];
        
        f_i[X] = p_i[VX];
        f_i[Y] = p_i[VY];
        f_i[Z] = p_i[VZ];
        f_i[VX] = 0.;
        f_i[VY] = 0.;
        f_i[VZ] = 0.;
        this.tree.walk(walker, p_i, f_i, i, self);
    };

    this.Phi /= 2.;
    this.timeStep_control = this.eps_control*Math.sqrt(this.timeStep_control);
};



System.prototype.bruteForce = function(t, p, f) {
    this.Phi = 0;
    var eps2 = SQR(this.eps);
    var K2 = Units.K2;
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

System.prototype.energy = function() {
    return this.kinetic() + this.potential();
};

System.prototype.writeSync = function(file) {
    _m.writeMatrixSync(file, this.p);
};

System.prototype.center = function() {
    var com = this.centerOfMass();
    for (var i = 0; i < this.size(); i++)
        for (var j = X; j <= VZ; j++)
            this.p[i][j] -= com[j];
};

System.prototype.translate = function(v6) {
    for (var i = 0; i < this.size(); i++)
        for (var j = X; j <= VZ; j++)
            this.p[i][j] += v6[j];
};

System.prototype.append = function(sys) {
    for (var i = 0; i < sys.size(); i++) {
        this.p.push(sys.ith(i));
        this.f.push(new DOUBLEARRAY(NPHYS*2));
    }
    this.tree = new BHTree();
};

System.prototype.tag = function(tag) {
    for (var i = 0; i < this.size(); i++) {
        this.ith(i)[TAG] = tag;
    };
};

System.prototype.shuffle = function() {
    this.p = _.shuffle(this.p);
};

System.prototype.sortBy = function(coord) {
    this.p.sort(function(pi, pj) { return pi[coord]-pj[coord]; });
};

System.prototype.toArray = function(arr, what) {
    var n = what.length;
    for (var i = 0; i < this.p.length; i++) {
        for (var j = 0; j < what.length; j++)
            arr[i*n+j] = this.p[i][what[j]];
    }
};

if (typeof(exports) !== 'undefined') {
    exports.System = System;
}

// Local Variables:
// eval: (add-hook 'after-save-hook (lambda() (shell-command "cd ..; make >/dev/null" nil)) nil t)
// End:
