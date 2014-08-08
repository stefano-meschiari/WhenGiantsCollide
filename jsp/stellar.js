"use strict";

/*
 stellar.js - version 0.1
 
 Creates a spherical stellar system in hydro equilibrium, from the given surface density.
 
*/

if (typeof module !== 'undefined' && module.exports) {
    var _m = require("./math.js")._m;
    var System = require("./system.js").System;
    var Units = require("./units.js").Units;    
}

ASSERT(BHTree);
ASSERT(Units);
ASSERT(_m);

var K2 = Units.K2;

function Stellar(N, rho, max_R, rng) {
    rng = rng || Math.random;
    
    var i;
    
    var R = _m.seq(0, max_R, 10*N);
    var M = _m.cumtrapzfun(R, function(R) { return 4.*Math.PI*R*R*rho(R); });
    R = _m.subset(R, -(R.length-1));
    var max_M = _m.max(M);

    var R_M = _m.vectorize(_m.interpFun(M, R));
    var M_R = _m.interpFun(R, M);

    var Ri = _m.sort(R_M(_m.uniformRandom(_m.zeros(N), 0, max_M, rng)));

    var sigma = _m.zeros(N);
    var out = [];
    var ctx = {};

    var sigma2 = [0];
    var R_from = Ri[Ri.length-1];
    sigma[Ri.length-1] = 0.;

    var Drho = _m.derivFun(rho);
    
    for (i = Ri.length-2; i >= 0; i--) {
        _m.rk(R_from, sigma2, function(R, y, f) {
            if (R == R_from)
                f[0] = 0.;

            f[0] = -K2*M_R(R)/(R*R) - y[0]/rho(R) * Drho(R);
        }, Ri[i], ctx);

        sigma[i] = Math.sqrt(sigma2[0]);
        R_from = Ri[i];
    }

    var s = new System(N);
    var v3 = _m.zeros(3);
    var j;
    var vel = _m.zeros(3);
    
    for (i = 0; i < s.size(); i++) {
        var p = s.ith(i);

        _m.sphereRandom(v3, Ri[i], rng);
        for (j = X; j <= Z; j++)
            p[j] = v3[j];
        
        _m.gaussianRandom(vel, 0, sigma[i], rng);
        while (_m.norm(vel) > 2.*Math.sqrt(K2*M_R(Ri[i])/Ri[i]))
            _m.gaussianRandom(vel, 0, sigma[i], rng);
            
        for (j = VX; j <= VZ; j++)
            p[j] = vel[j-VX];
        
        p[MASS] = max_M/s.size();
    }

    return s;
}

if (typeof(exports) !== 'undefined') {
    exports.Stellar = Stellar;
}



// Local Variables:
// eval: (add-hook 'after-save-hook (lambda() (shell-command "cd ..; make >/dev/null")) nil t)
// End:

