#define VA_NARGS_IMPL(_1, _2, _3, _4, _5, N, ...) N
#define VA_NARGS(...) VA_NARGS_IMPL(__VA_ARGS__, 5, 4, 3, 2, 1)

#define _A_IMPL2(count, ...) _A ## count (__VA_ARGS__)
#define _A_IMPL(count, ...) _A_IMPL2(count, __VA_ARGS__) 
#define _A(...) _A_IMPL(VA_NARGS(__VA_ARGS__), __VA_ARGS__)

#define _A5(out, v1, v2, v3, v4) for (var $i = 0, __v1 = (v1), __v2 = (v2), __v3 = (v3), __v4 = (v4), $1 = __v1[0], $2 = __v2[0], $3 = __v3[0], $4 = __v4[0],  __length = __v1.length; $i < __length; $i++, $1 = __v1[$i], $2 = __v2[$i], $3 = __v3[$i], $4 = __v4[$i]) out

#define _A1(out)  for (var $i = 0,  __length = out.length; $i < __length; $i++) out
#define _A2(out, v1) for (var $i = 0, __v1 = (v1), $1 = __v1[0],  __length = __v1.length; $i < __length; $i++, $1 = __v1[$i]) out
#define _A3(out, v1, v2) for (var $i = 0, __v1 = (v1), __v2 = (v2), $1 = __v1[0], $2 = __v2[0],  __length = __v1.length; $i < __length; $i++, $1 = __v1[$i], $2 = __v2[$i]) out
#define _A4(out, v1, v2, v3) for (var $i = 0, __v1 = (v1), __v2 = (v2), __v3 = (v3), $1 = __v1[0], $2 = __v2[0], $3 = __v3[0],  __length = __v1.length; $i < __length; $i++, $1 = __v1[$i], $2 = __v2[$i], $3 = __v3[$i]) out

#define _V(...) _A(__VA_ARGS__)[$i]


#define _M_IMPL2(count, ...) _M ## count (__VA_ARGS__)
#define _M_IMPL(count, ...) _M_IMPL2(count, __VA_ARGS__) 
#define _M(...) _M_IMPL(VA_NARGS(__VA_ARGS__), __VA_ARGS__)

#define _M5(out, v1, v2, v3, v4) for (var $j = 0; $j < out.length; $j++) _V(out[$j], v1[$j], v2[$j], v3[$j], v4[$j])
#define _M4(out, v1, v2, v3) for (var $j = 0; $j < out.length; $j++) _V(out[$j], v1[$j], v2[$j], v3[$j])
#define _M3(out, v1, v2) for (var $j = 0; $j < out.length; $j++) _V(out[$j], v1[$j], v2[$j])
#define _M2(out, v1) for (var $j = 0; $j < out.length; $j++) _V(out[$j], v1[$j])
#define _M1(out) for (var $j = 0; $j < out.length; $j++) _V(out[$j])


#define _max(out, v) { if (!IS_MATRIX(v)) { var out = v[0]; _A(out, v) = Math.max(out, $1) } else { var out = v[0][0]; for (var $j = 0; $j < v.length; $j++) { _A(out, v[$j]) = Math.max(out, $1); } } }
#define _min(out, v) { if (!IS_MATRIX(v)) { var out = v[0]; _A(out, v) = Math.min(out, $1) } else { var out = v[0][0]; for (var $j = 0; $j < v.length; $j++) { _A(out, v[$j]) = Math.min(out, $1); } } }
#define _dot(out, v1, v2) { var out = 0.; for (var $i = 0; $i < v1.length; $i++) out += v1[$i]*v2[$i]; }

#define _norm(out, v) { _dot(out, v, v); out = Math.sqrt(out); }
