"use strict";
if (typeof(exports) !== 'undefined')
    var fs = require('fs');

var _m = {};

// Returns the minimum of the given vector (inline version: _min)
_m.min = function(v) {
    _min(min, v);
    return min;
};

// Returns the maximum of the given vector (inline version: _max)
_m.max = function(v) {
    _max(max, v);
    return max;
};

// Returns the dot product of two vectors (inline version: _dot)
_m.dot = function(v1, v2) {
    _dot(dot, v1, v2);
    return dot;
};

// Returns the norm of the vector (inline version: _norm)
_m.norm = function(v) {
    _norm(norm, v);
    return norm;
};

_m.log = function(v, fmt) {
    fmt = fmt || _m.defaultFormat;
    var i, j;
    var str = [];
    
    if (v === null)
        console.log(null);
    if (typeof(v) === 'number')
        console.log(fmt(v));
    else if (v.length == 0)
        console.log('[0]');
    else if (typeof(v[0]) === 'object') {
        for (i = 0; i < v.length; i++) {
            str.push('[' + i + ']');
            for (j = 0; j < v[0].length; j++)
                str.push('[' + j + '] ' + fmt(v[i][j]) + ' ');
            if (i != v.length-1)
                str.push('\n');
        }
        console.log(str.join(''));
    } else {

        for (j = 0; j < v.length; j++) {
            str.push('[' + j + '] ' + fmt(v[j]) + ' ');
        }
        console.log(str.join(''));
    }
};

// A seeded random number generator. Only use for testing!
_m.seededRandom = function(seed) {
    var m = Math.pow(2, 32);
    var a = 1664525;
    var c = 1013904223;
    var x = seed;
    return function() {
        x = (a*x+c)%m;
        return x/m;
    };
};

_m.uniformRandom = function(v, a, b, random) {
    a = a || 0;
    b = b || 1;
    v = v || _m.zeros(1);

    _V(v) = a + (b-a) * random();
    
    return v;
};

// Fills v with normally distributed random numbers with given mean and std. dev.
// (default = 0 and 1)
_m.gaussianRandom = function(v, mean, s, random) {
    random = random || Math.random;
    mean = mean || 0;
    s = s || 1;
    v = v || _m.zeros(1);
    
    _V(v) = mean + s*Math.sqrt(-2 * Math.log(random())) * Math.cos(2.*Math.PI * random());

    return v;
};

_m.sphereRandom = function(v, random) {
    v = v || _m.zeros(3);
    random = random || Math.random;
    _m.gaussianRandom(v, 0, 1, random);
    _norm(norm, v);
    _V(v) /= norm;
    return v;
};

_m.rejectionSampling = function(v, f, g, xg, random) {
    v = v || _m.zeros(1);
    random = random || Math.random;

    var x, u, g_x;
    for (var i = 0; i < v.length; i++) {
        do {
            x = xg();
            u = random();
        } while (u < f(x)/g(x));
        v[i] = x;
    }
    return v;
};



_m.toArray = function(floatArray) {
    if (floatArray === null) return null;
    var ret = new Array(floatArray.length);
    
    if (floatArray.length > 0 && typeof(floatArray[0]) === 'object') {
        for (var j = 0; j < floatArray.length; j++)
            ret[j] = _m.toArray(floatArray[j]);
    } else {
        _V(ret, floatArray) = $1;
    }
    return ret;
};

_m.toFloat64Array = function(array) {
    if (array === null) return null;
    
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

_m.isNaN = function(v) {
    var nan = false;

    if (v.length > 0 && typeof(v[0]) == 'object') {
        for (var i = 0; i < v.length; i++)
            for (var j = 0; j < v[0].length; j++)
                nan |= isNaN(v[i][j]);
    } else {
        _a(nan, v) |= isNaN($1); 
    }
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
        return(v1);
    } else {
        var v2 = new Array(N1);
        for (var i = 0; i < N1; i++)
            v2[i] = new Float64Array(N2);
        return v2;
    }
};

_m.seq = function(a, b, N) {
    var v = new Float64Array(N);
    _V(v) = a + (b-a)/(N-1) * $i;
    return(v);
};

/*
_m.trapz = function(f, x) {
    var q = 0;
    for (var i = 0; i < f.length-1; i++)
        q += (x[i+1]-x[i]) * (f[i+1]+f[i]);
    return 0.5*q;
};
*/

_m.bisect = function(a, b, f, eps, ctx) {
    eps = eps || 1e-6 * Math.abs(a-b);
    
    var f_a = f(a, ctx);
    var f_b = f(b, ctx);
    
    if (f_a * f_b > 0)
        throw 'bisect: Function is not bracketed.';

    var x = 0.5 * (a+b);

    while (Math.abs(a-b) > eps) {
        var f_x = f(x, ctx);
        if (f_x*f_a > 0) {
            f_a = f_x;
            a = x;
        } else {
            f_b = f_x;
            b = x;
        }
        x = 0.5*(a+b);
    };
    
    return x;
    
};

_m.rk23 = function(t, y0, f, tout, ctx) {
    var isMatrix = (typeof(y0[0]) === 'object');
    
    var nrows = y0.length;
    var ncols = (isMatrix ? y0[0].length : 0);

    ctx = ctx || {};
    
    f = f.bind(ctx);
    ctx.f1 = ctx.f1 || _m.zeros(nrows, ncols);
    ctx.f2 = ctx.f2 || _m.zeros(nrows, ncols);
    ctx.f3 = ctx.f3 || _m.zeros(nrows, ncols);
    ctx.y1 = ctx.y1 || _m.zeros(nrows, ncols);
    ctx.dt = ctx.dt || 0.01;
    ctx.eps_abs = ctx.eps_abs || 1e-5;
    ctx.eps_rel = ctx.eps_rel || 1e-5;

    var dt_avg = 0;
    var steps = 0;
    
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
    var i, j, err, dt_trial;
    

    while (t < tout) {
        dt_new = dt;
        
        do {
            if (!isMatrix) {
                for (i = 0; i < nrows; i++)
                    f1[i] = f2[i] = f3[i] = 0.;
            } else {
                
                for (i = 0; i < nrows; i++)
                    for (j = 0; j < ncols; j++)
                        f1[i][j] = f2[i][j] = f3[i][j] = 0.;
            }
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
            } else
                dt_trial = dt;

            DEBUG((function() {
               if (dt_trial < 0.1 * dt) {
                   console.log(dt, dt_trial);
                   throw '';
               };
            })());

            if (dt_trial > 5.*dt)
                dt_trial = 5.*dt;
            else if (dt_trial < 0.2 * dt)
                dt_trial = 0.2*dt;

            dt_new = Math.min(dt_trial, tout-t);

            if (isNaN(dt_new)) {
                throw 'dt_new is NaN. ' + dt_trial + " " + dt + " " + err + " " + (tout-t);
            } else if (_m.isNaN(a2))
                throw 'a2 is NaN.';
                
        } while (dt > dt_new);

        t += dt;
        dt_avg += dt;
        steps++;
        dt = dt_new;
        

        if (!isMatrix)
            _V(y0, a2) = $1;
        else
            _M(y0, a2) = $1;
    };

    ctx.dt = dt;
    ctx.dt_avg = dt_avg/steps;
    return ctx;
};


if (typeof(exports) !== 'undefined')
    exports._m = _m;




// Local Variables:
// eval: (add-hook 'after-save-hook (lambda() (shell-command "cd ..; make >/dev/null" nil)) nil t)
// End:
