





"use strict";

var _M = {};

_M.rk23 = function(t, y0, f, dt, f1, f2, f3) {
    f1 = f1 || [];
    f2 = f2 || [];
    f3 = f3 || [];
    
    f(t, y0, f1);

    var y1 = [];
    { for (var __i = 0, __v1 = ( y0), __v2 = ( f1), __length = __v.length; __i < __length; __i++) { f1[__i] = __v1[__i] +  dt * __v2[__i]; }};
};


