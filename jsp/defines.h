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

#define VLOOP(v) for (var __i = 0, __v = (v), __length = __v.length; __i < __length; __i++)
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


#define INTERSECT(ax, AX, bx, BX) ((ax) <= (BX) && (AX) >= (bx))
#define NODEINTERSECTS(n, w, p, d) (INTERSECT(n[X], n[X]+w, p[X]-d, p[X]+d) && INTERSECT(n[Y], n[Y]+w, p[Y]-d, p[Y]+d) && INTERSECT(n[Z], n[Z]+w, p[Z]-d, p[Z]+d))
    




#ifdef DEBUG
#define LOG(...) (console.log(__VA_ARGS__))
#define ASSERT(x, ...) if (!x) console.error(__FILE__, " ", __LINE__, ": ", __VA_ARGS__)
#else
#define LOG(...) {}
#define ASSERT(x, ...) {}
#endif
