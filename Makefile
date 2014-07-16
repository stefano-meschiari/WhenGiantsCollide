NODE=/opt/local/bin/node --trace_exception
UGLIFYJS=uglifyjs -m -c -o
MODE=PROD
CPP=cpp -nostdinc -undef -D$(MODE) -P -ansi -traditional-cpp -imacros js/defines.h

test: algo-prod.js
	$(NODE) js/algo-test.js

algo-prod.js: js/algo.js js/defines.h
	$(CPP) js/algo.js js/algo-prod.js


