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
#define CACHE_LENGTH 10000

#define DOUBLEARRAY Float64Array

#define SQR(x) ((x)*(x))
#define D2(pi, pj) (SQR(pi[X]-pj[X]) + SQR(pi[Y]-pj[Y]) + SQR(pi[Z] - pj[Z]))
#define BETWEEN(x, a, b) ((x >= a) && (x <= b))
#define CONTAINS(p, min, width) (BETWEEN(p[X], min[X], min[X]+width) && BETWEEN(p[Y], min[Y], min[Y]+width) && BETWEEN(p[Z], min[Z], min[Z]+width)) 

#define VSET(y, x1) { y[X] = x1[X]; y[Y] = x1[Y]; y[Z] = x1[Z]; }
#define VSET3(v, x, y, z) { v[X]=x; v[Y]=y; v[Z]=z; }
#define VADD(y, x1, x2) { y[X] = x1[X]+x2[X]; y[Y] = x1[Y]+x2[Y]; y[Z] = x1[Z]+x2[Z]; }
#define VMUL(y, a) { y[X] *= a; y[Y] *= a; y[Z] *= a; }

#define INTERSECT(ax, AX, bx, BX) ((ax) <= (BX) && (AX) >= (bx))
#define NODEINTERSECTS(n, w, p, d) (INTERSECT(n[X], n[X]+w, p[X]-d, p[X]+d) && INTERSECT(n[Y], n[Y]+w, p[Y]-d, p[Y]+d) && INTERSECT(n[Z], n[Z]+w, p[Z]-d, p[Z]+d))
    

#ifdef DEBUG
#define LOG(...) (console.log(__VA_ARGS__))
#define ASSERT(x, ...) if (!x) console.error(__FILE__, " ", __LINE__, ": ", __VA_ARGS__)
#else
#define LOG(...) {}
#define ASSERT(x, ...) {}
#endif
