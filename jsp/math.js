"use strict";

var _M = {};

_M.rk23 = function(t, y0, f, dt, f1, f2, f3) {
    f1 = f1 || [];
    f2 = f2 || [];
    f3 = f3 || [];
    
    f(t, y0, f1);

    var y1 = [];
    VADDMULS(f1, y0, dt, f1);
};

