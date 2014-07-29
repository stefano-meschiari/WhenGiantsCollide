"use strict";

/*
 stellar.js - version 0.1
 
 Creates a spherical stellar system in hydro equilibrium, from the given surface density.
 
*/

if (typeof module !== 'undefined' && module.exports) {
    var _m = require("./math.js")._m;
    var System = require("./system.js").System;
    var Units = require("./units.js").Units;
    var K2 = Units.K2;
}

function Stellar(N, rho, max_R, rng) {
    rng = rng || Math.random;
    
    var s = new System(N);

    var R = _m.seq(0, max_R, 10*N);
    var M = _m.cumtrapzfun(R, function(R) { return 4.*Math.PI*R*R*rho(R); });
    R = _m.subset(R, -(R.length-1));
    var max_M = _m.max(M);

    var R_M = _m.vectorize(_m.interpFun(M, R));
    var M_R = _m.interpFun(R, M);
    var Ri = _m.sort(R_M(_m.uniformRandom(N, 0, max_M)));

    // d\rho sigma^2 = -GM(r)/r^2 rho
    var sigma2 = _m.zeros(N);
    var out = [];
    var ctx = {};

    var rhosigma2 = 0;
    var R_from = 0.;
    for (var i = 0; i < N; i++) {
        rhosigma2 = _m.rk23(R_from, rhosigma2, function(R, _) {
            return -K2*M_R(R)/(R*R) * rho(R);
        }, R[i], ctx);

        console.log(R, rhosigma2/rho(R[i]));
    }
    
}

if (typeof(exports) !== 'undefined') {
    exports.Stellar = Stellar;
}



// Local Variables:
// eval: (add-hook 'after-save-hook (lambda() (shell-command "cd ..; make >/dev/null")) nil t)
// End:

