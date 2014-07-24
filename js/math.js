

"use strict";
var _M = {};
_M.zeros = function(N1, N2) {
    if (typeof(N2) === 'undefined' || N2 === 0) {
        var v1 = new Float64Array(N1);
        for (var $i = 0, __length = v1.length; $i < __length; $i++) v1[$i] = 0.;
        return(v1);
    } else {
        var v2 = new Array(N1);
        for (var i = 0; i < N1; i++)
            v2[i] = new FloatArray(N2);
        return v2;
    }
};
_M.rk23 = function(t, y0, f, tout, ctx) {
    var isMatrix = (typeof(y0[0]) === 'object');
    var nrows = y0.length;
    var ncols = (isMatrix ? y0[0].length : 0);
    // Reuse arrays as possible
    ctx.f1 = ctx.f1 || _M.zeros(nrows, ncols);
    ctx.f2 = ctx.f2 || _M.zeros(nrows, ncols);
    ctx.f3 = ctx.f3 || _M.zeros(nrows, ncols);
    ctx.y1 = ctx.y1 || _M.zeros(nrows, ncols);
    ctx.dt = ctx.dt || 0.01;
    ctx.eps_abs = ctx.eps_abs || 1e-3;
    ctx.eps_rel = ctx.eps_rel || 1e-3;
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
        console.log(t, y0[0]);
        do {
            dt = dt_new;
            f(t, y0, f1);
            if (!isMatrix)
                for (var $i = 0, __v1 = (y0), __v2 = (f1), $1 = __v1[0], $2 = __v2[0], __length = y0.length; $i < __length; $i++, $1 = __v1[$i], $2 = __v2[$i]) y1[$i] = $1 + dt * $2;
            else
                for (var $j = 0; $j < y1.length; $j++) for (var $i = 0, __v1 = (y0[$j]), __v2 = (f1[$j]), $1 = __v1[0], $2 = __v2[0], __length = y0[$j].length; $i < __length; $i++, $1 = __v1[$i], $2 = __v2[$i]) y1[$j][$i] = $1 + dt * $2;
            f(t + dt, y1, f2);
            if (!isMatrix)
                for (var $i = 0, __v1 = (y0), __v2 = (f1), __v3 = (f2), $1 = __v1[0], $2 = __v2[0], $3 = __v3[0], __length = y0.length; $i < __length; $i++, $1 = __v1[$i], $2 = __v2[$i], $3 = __v3[$i]) y1[$i] = $1 + 0.25 * dt * ($2+$3);
            else
                for (var $j = 0; $j < y1.length; $j++) for (var $i = 0, __v1 = (y0[$j]), __v2 = (f1[$j]), __v3 = (f2[$j]), $1 = __v1[0], $2 = __v2[0], $3 = __v3[0], __length = y0[$j].length; $i < __length; $i++, $1 = __v1[$i], $2 = __v2[$i], $3 = __v3[$i]) y1[$j][$i] = $1 + 0.25 * dt * ($2+$3);
            f(t + 0.5 * dt, y1, f3);
            if (!isMatrix) {
                for (var $i = 0, __v1 = (y0), __v2 = (f1), __v3 = (f2), $1 = __v1[0], $2 = __v2[0], $3 = __v3[0], __length = y0.length; $i < __length; $i++, $1 = __v1[$i], $2 = __v2[$i], $3 = __v3[$i]) a1[$i] = $1 + 0.5 * dt * ($2 + $3);
                for (var $i = 0, __v1 = (y0), __v2 = (f1), __v3 = (f2), __v4 = (f3), $1 = __v1[0], $2 = __v2[0], $3 = __v3[0], $4 = __v4[0], __length = y0.length; $i < __length; $i++, $1 = __v1[$i], $2 = __v2[$i], $3 = __v3[$i], $4 = __v4[$i]) a2[$i] = $1 + dt/6. * ($2+$3+4.*$4);
                for (var $i = 0, __v1 = (y0), $1 = __v1[0], __length = y0.length; $i < __length; $i++, $1 = __v1[$i]) D[$i] = eps_abs + eps_rel * Math.abs($1);
                for (var $i = 0, __v1 = (a1), __v2 = (a2), $1 = __v1[0], $2 = __v2[0], __length = a1.length; $i < __length; $i++, $1 = __v1[$i], $2 = __v2[$i]) E[$i] = Math.abs($1-$2);
            } else {
                for (var $j = 0; $j < a1.length; $j++) for (var $i = 0, __v1 = (y0[$j]), __v2 = (f1[$j]), __v3 = (f2[$j]), $1 = __v1[0], $2 = __v2[0], $3 = __v3[0], __length = y0[$j].length; $i < __length; $i++, $1 = __v1[$i], $2 = __v2[$i], $3 = __v3[$i]) a1[$j][$i] = $1 + 0.5 * dt * ($2 + $3);
                for (var $j = 0; $j < a2.length; $j++) for (var $i = 0, __v1 = (y0[$j]), __v2 = (f1[$j]), __v3 = (f2[$j]), __v4 = (f3[$j]), $1 = __v1[0], $2 = __v2[0], $3 = __v3[0], $4 = __v4[0], __length = y0[$j].length; $i < __length; $i++, $1 = __v1[$i], $2 = __v2[$i], $3 = __v3[$i], $4 = __v4[$i]) a2[$j][$i] = $1 + dt/6. * ($2+$3+4.*$4);
                for (var $j = 0; $j < D.length; $j++) for (var $i = 0, __v1 = (y0[$j]), $1 = __v1[0], __length = y0[$j].length; $i < __length; $i++, $1 = __v1[$i]) D[$j][$i] = eps_abs + eps_rel * Math.abs($1);
                for (var $j = 0; $j < E.length; $j++) for (var $i = 0, __v1 = (a1[$j]), __v2 = (a2[$j]), $1 = __v1[0], $2 = __v2[0], __length = a1[$j].length; $i < __length; $i++, $1 = __v1[$i], $2 = __v2[$i]) E[$j][$i] = Math.abs($1-$2);
            }
            err = -1e20;
            if (!isMatrix)
                for (var $i = 0, __v1 = (E), __v2 = (D), $1 = __v1[0], $2 = __v2[0], __length = E.length; $i < __length; $i++, $1 = __v1[$i], $2 = __v2[$i]) err = Math.max(err, ($1-$2)/$2);
            else
                for (j = 0; j < nrows; j++)
                    for (var $i = 0, __v1 = (E[j]), __v2 = (D[j]), $1 = __v1[0], $2 = __v2[0], __length = E[j].length; $i < __length; $i++, $1 = __v1[$i], $2 = __v2[$i]) err = Math.max(err, ($1-$2)/$2);
            console.log('t = ', t, ' dt = ', dt);
            console.log('a1 = ', a1[0]);
            console.log('a2 = ', a2[0]);
            console.log('D = ', D[0]);
            console.log('err = ', err);
            if (err > 0.1) {
                err = 0;
                if (!isMatrix) {
                    for (var $i = 0, __v1 = (E), __v2 = (D), $1 = __v1[0], $2 = __v2[0], __length = E.length; $i < __length; $i++, $1 = __v1[$i], $2 = __v2[$i]) E[$i] = $1/$2;
                    { err = E[0]; for (var $i = 0, __v1 = (E), $1 = __v1[0], __length = E.length; $i < __length; $i++, $1 = __v1[$i]) err = Math.max(err, $1) };
                } else {
                    for (var $j = 0; $j < E.length; $j++) for (var $i = 0, __v1 = (E[$j]), __v2 = (D[$j]), $1 = __v1[0], $2 = __v2[0], __length = E[$j].length; $i < __length; $i++, $1 = __v1[$i], $2 = __v2[$i]) E[$j][$i] = $1/$2;
                    for (j = 0; j < nrows; j++) {
                        { err = E[j][0]; for (var $i = 0, __v1 = (E[j]), $1 = __v1[0], __length = E[j].length; $i < __length; $i++, $1 = __v1[$i]) err = Math.max(err, $1) };
                    }
                }
                dt_trial = dt * S * Math.pow(err, -1./q);
            } else if (err <= 0.) {
                err = 0.;
                if (!isMatrix) {
                    for (var $i = 0, __v1 = (E), __v2 = (D), $1 = __v1[0], $2 = __v2[0], __length = E.length; $i < __length; $i++, $1 = __v1[$i], $2 = __v2[$i]) E[$i] = $1/$2;
                    { err = E[0]; for (var $i = 0, __v1 = (E), $1 = __v1[0], __length = E.length; $i < __length; $i++, $1 = __v1[$i]) err = Math.max(err, $1) };
                } else {
                    for (var $j = 0; $j < E.length; $j++) for (var $i = 0, __v1 = (E[$j]), __v2 = (D[$j]), $1 = __v1[0], $2 = __v2[0], __length = E[$j].length; $i < __length; $i++, $1 = __v1[$i], $2 = __v2[$i]) E[$j][$i] = $1/$2;
                    for (j = 0; j < nrows; j++) {
                        { err = E[j][0]; for (var $i = 0, __v1 = (E[j]), $1 = __v1[0], __length = E[j].length; $i < __length; $i++, $1 = __v1[$i]) err = Math.max(err, $1) };
                    }
                }
                dt_trial = dt * S * Math.pow(err, -1./(q+1));
            }
            if (dt_trial > 5.*dt)
                dt_trial = 5.*dt;
            else if (dt_trial < 0.2 * dt)
                dt_trial = 0.2*dt;
            console.log('err = ', err);
            console.log('dt_new = ', dt_trial);
            dt_new = Math.min(dt_trial, tout-t);
        } while (dt > dt_new);
        console.log('');
        console.log('dt = ', dt);
        t += dt;
        dt = dt_new;
        for (var $i = 0, __v1 = (a2), $1 = __v1[0], __length = a2.length; $i < __length; $i++, $1 = __v1[$i]) y0[$i] = $1;
    };
    ctx.dt = dt;
    return t;
};
/* Test */
var t = 0;
var y0 = [1.];
var f = function(t, y, fout) {
    fout[0] = -y[0];
};
var ctx = {};
console.log(y0[0]);
t = _M.rk23(t, y0, f, 1, ctx);
console.log(y0[0], Math.exp(-1), t, ctx.dt);
