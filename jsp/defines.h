#define X 0
#define Y 1
#define Z 2
#define U 3
#define V 4
#define W 5
#define MASS 6
#define RHO 7
#define H 8
#define BODY 9
#define NCOORDS 10
#define NPHYS 3


#define NSUB 8

#define DOUBLEARRAY Float64Array

#define SQR(x) ((x)*(x))
#define D2(pi, pj) (SQR(pi[X]-pj[X]) + SQR(pi[Y]-pj[Y]) + SQR(pi[Z] - pj[Z]))
#define BETWEEN(x, a, b) ((x >= a) && (x <= b))
#define CONTAINS(p, min, width) (BETWEEN(p[X], min[X], min[X]+width) && BETWEEN(p[Y], min[Y], min[Y]+width) && BETWEEN(p[Z], min[Z], min[Z]+width)) 

#define V3SET(y, x1) { y[X] = x1[X]; y[Y] = x1[Y]; y[Z] = x1[Z]; }
#define V3SET3(v, x, y, z) { v[X]=x; v[Y]=y; v[Z]=z; }
#define V3ZERO(v) { v[X] = 0.; v[Y] = 0.; v[Z] = 0.;}
#define V3ADD(y, x1, x2) { y[X] = x1[X]+x2[X]; y[Y] = x1[Y]+x2[Y]; y[Z] = x1[Z]+x2[Z]; }
#define V3MUL(y, a) { y[X] *= a; y[Y] *= a; y[Z] *= a; }

#define V3MIN(v, v1, v2) { v[X] = Math.min(v1[X], v2[X]); v[Y] = Math.min(v1[Y], v2[Y]); v[Z] = Math.min(v1[Z], v2[Z]);}
#define V3MAX(v, v1, v2) { v[X] = Math.max(v1[X], v2[X]); v[Y] = Math.max(v1[Y], v2[Y]); v[Z] = Math.max(v1[Z], v2[Z]);}

#define VA_NARGS_IMPL(_1, _2, _3, _4, _5, N, ...) N
#define VA_NARGS(...) VA_NARGS_IMPL(__VA_ARGS__, 5, 4, 3, 2, 1)

#define _a_IMPL2(count, ...) _a ## count (__VA_ARGS__)
#define _a_IMPL(count, ...) _a_IMPL2(count, __VA_ARGS__) 
#define _a(...) _a_IMPL(VA_NARGS(__VA_ARGS__), __VA_ARGS__)

#define _a5(out, v1, v2, v3, v4) for (var $i = 0, __v1 = (v1), __v2 = (v2), __v3 = (v3), __v4 = (v4), $1 = __v1[0], $2 = __v2[0], $3 = __v3[0], $4 = __v4[0],  __length = v1.length; $i < __length; $i++, $1 = __v1[$i], $2 = __v2[$i], $3 = __v3[$i], $4 = __v4[$i]) out

#define _a1(out)  for (var $i = 0,  __length = out.length; $i < __length; $i++) out
#define _a2(out, v1) for (var $i = 0, __v1 = (v1), $1 = __v1[0],  __length = v1.length; $i < __length; $i++, $1 = __v1[$i]) out
#define _a3(out, v1, v2) for (var $i = 0, __v1 = (v1), __v2 = (v2), $1 = __v1[0], $2 = __v2[0],  __length = v1.length; $i < __length; $i++, $1 = __v1[$i], $2 = __v2[$i]) out
#define _a4(out, v1, v2, v3) for (var $i = 0, __v1 = (v1), __v2 = (v2), __v3 = (v3), $1 = __v1[0], $2 = __v2[0], $3 = __v3[0],  __length = v1.length; $i < __length; $i++, $1 = __v1[$i], $2 = __v2[$i], $3 = __v3[$i]) out




/*#define _v_IMPL2(count, ...) _v ## count (__VA_ARGS__)
#define _v_IMPL(count, ...) _v_IMPL2(count, __VA_ARGS__) 
#define _v(...) _v_IMPL(VA_NARGS(__VA_ARGS__), __VA_ARGS__)

#define _v1(out) _a1(out)[$i]
#define _v2(out, v) _a2(out,v)[$i]
#define _v3(out, v1, v2) _a3(out, v1, v2)[$i]
#define _v4(out, v1, v2, v3) _a4(out, v1, v2, v3)[$i] 
#define _v5(out, v1, v2, v3, v4) _a5(out, v1, v2, v3, v4)[$i] 
*/
#define _v(...) _a(__VA_ARGS__)[$i]


#define _M_IMPL2(count, ...) _M ## count (__VA_ARGS__)
#define _M_IMPL(count, ...) _M_IMPL2(count, __VA_ARGS__) 
#define _M(...) _M_IMPL(VA_NARGS(__VA_ARGS__), __VA_ARGS__)

#define _M5(out, v1, v2, v3, v4) for (var $j = 0; $j < out.length; $j++) _v(out[$j], v1[$j], v2[$j], v3[$j], v4[$j])
#define _M4(out, v1, v2, v3) for (var $j = 0; $j < out.length; $j++) _v(out[$j], v1[$j], v2[$j], v3[$j])
#define _M3(out, v1, v2) for (var $j = 0; $j < out.length; $j++) _v(out[$j], v1[$j], v2[$j])
#define _M2(out, v1) for (var $j = 0; $j < out.length; $j++) _v(out[$j], v1[$j])
#define _M1(out) for (var $j = 0; $j < out.length; $j++) _v(out[$j])


#define _max(out, v) { out = v[0]; _a(out, v) = Math.max(out, $1) }
#define _min(out, v) { out = v[0]; _a(out, v) = Math.min(out, $1) }


/*
#define VLOOP(v) for (var $i = 0, $1 = (v), __length = $1.length; $i < __length; $i++)
#define VLOOP2(v1, v2) for (var __i = 0, __v1 = (v1), __v2 = (v2), __length = __v.length; __i < __length; __i++)
#define VSQR(out, v) { var out = 0; VLOOP(v) out += SQR(__v[__i]); }
#define VNORM(out, v) { VSQR(out, v); out = Math.sqrt(out); }
#define VSET(out, v) { VLOOP(v) { out[__i] = __v[__i] };}
#define VADD(out, v1, v2) { VLOOP(v1, v2) { out[__i] = __v1[__i] + __v2[__i]; };}
#define VMUL(out, v1, v2) { VLOOP2(v1, v2) { out[__i] = __v1[__i] * __v2[__i]; }}
#define VADDS(out, v, a) { VLOOP(v) { out[__i] = __v[__i] + a; }}
#define VMULS(out, v, a) { VLOOP(v) { out[__i] = __v[__i] * a; }}
#define VADDMULS(out, v1, a, v2) { VLOOP2(v1, v2) { out[__i] = __v1[__i] + a * __v2[__i]; }}
#define VSUB(out, v1, v2) { VLOOP2(v1,v2) { out[__i] = __v1[__i] - __v2[__i]; }}
#define VFILLS(out, a) { VLOOP(out) { out[__i] = a; };}
*/

#define INTERSECT(ax, AX, bx, BX) ((ax) <= (BX) && (AX) >= (bx))
#define NODEINTERSECTS(n, w, p, d) (INTERSECT(n[X], n[X]+w, p[X]-d, p[X]+d) && INTERSECT(n[Y], n[Y]+w, p[Y]-d, p[Y]+d) && INTERSECT(n[Z], n[Z]+w, p[Z]-d, p[Z]+d))
    




#ifdef DEBUG
#define LOG(...) (console.log(__VA_ARGS__))
#define ASSERT(x, ...) if (!x) console.error(__FILE__, " ", __LINE__, ": ", __VA_ARGS__)
#else
#define LOG(...) {}
#define ASSERT(x, ...) {}
#endif
