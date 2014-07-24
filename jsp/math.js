"use strict";
if (typeof(exports) !== 'undefined')
    var fs = require('fs');

var _m = {};

_m.min = function(v) {
    _min(min, v);
    return min;
};

_m.max = function(v) {
    _max(max, v);
    return max;
};

_m.dot = function(v1, v2) {
    _dot(dot, v1, v2);
    return dot;
};

_m.norm = function(v) {
    _norm(norm, v);
    return norm;
};

_m.sphereRandom = function(v) {
    v = v || _m.zeros(3);
    _V(v) = Math.random() - 0.5;
    _norm(norm, v);
    _V(v) /= norm;
    return v;
};

_m.toArray = function(floatArray) {
    var ret = new Array(floatArray.length);
    _V(ret, floatArray) = $1;
    return ret;
};

_m.toFloat64Array = function(array) {
    var ret = new Float64Array(floatArray.length);
    _V(ret, array) = $1;
    return ret;
};

_m.defaultFormat = function(n) {
    return n.toExponential(5);
};


_m.format = function(v, fmt) {
    fmt = fmt || _m.defaultFormat;

    var s = new Array(v.length);
    for (var i = 0; i < s.length; i++)
        s[i] = fmt(v[i]);
    return s;
};

_m.writeVectorSync = function(file, v, fmt) {
    fmt = fmt || _m.defaultFormat;
    fs.writeFileSync(file, _m.format(v, fmt).join("\n"));
};

_m.writeMatrixSync = function(file, m, fmt) {
    fmt = fmt || _m.defaultFormat;
    var sm = [];
    for (var i = 0; i < m.length; i++)
        sm[i] = _m.format(m[i], fmt).join("\t");
    fs.writeFileSync(file, sm.join("\n"));
};

_m.zeros = function(N1, N2) {
    if (typeof(N2) === 'undefined' || N2 === 0) {
        var v1 = new Float64Array(N1);
        _V(v1) = 0.;
        return(v1);
    } else {
        var v2 = new Array(N1);
        for (var i = 0; i < N1; i++)
            v2[i] = new Float64Array(N2);
        return v2;
    }
};

_m.rk23 = function(t, y0, f, tout, ctx) {
    var isMatrix = (typeof(y0[0]) === 'object');
    
    var nrows = y0.length;
    var ncols = (isMatrix ? y0[0].length : 0);
    
    ctx.f1 = ctx.f1 || _m.zeros(nrows, ncols);
    ctx.f2 = ctx.f2 || _m.zeros(nrows, ncols);
    ctx.f3 = ctx.f3 || _m.zeros(nrows, ncols);
    ctx.y1 = ctx.y1 || _m.zeros(nrows, ncols);
    ctx.dt = ctx.dt || 0.01;
    ctx.eps_abs = ctx.eps_abs || 1e-5;
    ctx.eps_rel = ctx.eps_rel || 1e-5;

    
    var S = 0.9;
    var q = 2;
    
    var f1 = ctx.f1;
    var f2 = ctx.f2;
    var f3 = ctx.f3;
    var y1 = ctx.y1;
    var dt = ctx.dt;
    
    // Absolute and relative precision
    var eps_abs = ctx.eps_abs;
    var eps_rel = ctx.eps_rel;

    // Reuse arrays
    var a1 = y1;
    var a2 = f3;
    var D = f2;
    var E = f1;

    var dt_new = dt;
    var j, err, dt_trial;
    

    while (t < tout) {
        dt_new = dt;
        
        do {
            dt = dt_new;
            
            f(t, y0, f1);
            if (!isMatrix)
                _V(y1, y0, f1) = $1 + dt * $2;
            else
                _M(y1, y0, f1) = $1 + dt * $2;

            f(t + dt, y1, f2);
            if (!isMatrix)
                _V(y1, y0, f1, f2) = $1 + 0.25 * dt * ($2+$3);
            else
                _M(y1, y0, f1, f2) = $1 + 0.25 * dt * ($2+$3);

            f(t + 0.5 * dt, y1, f3);

            if (!isMatrix) {
                _V(a1, y0, f1, f2) = $1 + 0.5 * dt * ($2 + $3);
                _V(a2, y0, f1, f2, f3) = $1 + dt/6. * ($2+$3+4.*$4);

                _V(D, y0) = eps_abs + eps_rel * Math.abs($1);
                _V(E, a1, a2) = Math.abs($1-$2);
            } else {
                _M(a1, y0, f1, f2) = $1 + 0.5 * dt * ($2 + $3);
                _M(a2, y0, f1, f2, f3) = $1 + dt/6. * ($2+$3+4.*$4);

                _M(D, y0) = eps_abs + eps_rel * Math.abs($1);
                _M(E, a1, a2) = Math.abs($1-$2);                    
            }

            
            err = -1e20;
            if (!isMatrix)
                _A(err, E, D) = Math.max(err, ($1-$2)/$2);
            else
                for (j = 0; j < nrows; j++)
                    _A(err, E[j], D[j]) = Math.max(err, ($1-$2)/$2);
            
            if (err > 0.1) {
                err = 0;
                if (!isMatrix) {
                    _V(E, E, D) = $1/$2;
                    _max(err, E);
                } else {
                    _M(E, E, D) = $1/$2;
                    for (j = 0; j < nrows; j++) {
                        _max(err, E[j]);
                    }
                }
                
                dt_trial = dt * S * Math.pow(err, -1./q);
            } else if (err <= 0.) {
                err = 0.;
                if (!isMatrix) { 
                    _V(E, E, D) = $1/$2;
                    _max(err, E);
                } else {
                    _M(E, E, D) = $1/$2;
                    for (j = 0; j < nrows; j++) {
                        _max(err, E[j]);
                    }
                }
                dt_trial = dt * S * Math.pow(err, -1./(q+1));
            }

            
            if (dt_trial > 5.*dt)
                dt_trial = 5.*dt;
            else if (dt_trial < 0.2 * dt)
                dt_trial = 0.2*dt;

            dt_new = Math.min(dt_trial, tout-t);

            
        } while (dt > dt_new);
        
        t += dt;
        dt = dt_new;

        if (!isMatrix)
            _V(y0, a2) = $1;
        else
            _M(y0, a2) = $1;
    };

    ctx.dt = dt;
    return t;
};


if (typeof(exports) !== 'undefined')
    exports._m = _m;

// Local Variables:
// eval: (add-hook 'after-save-hook (lambda() (start-process-shell-command "cd ..; make " nil t)))
// End:

