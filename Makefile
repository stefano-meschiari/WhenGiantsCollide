NODE=/opt/local/bin/node --trace_exception
UGLIFYJS=uglifyjs -m -c -o
MODE=PROD
CPP=cpp -nostdinc -undef -D$(MODE) -P -ansi -traditional-cpp -imacros js/defines.h

tree-test: jsc/bhtree.js jsc/system.js
	$(NODE) jsc/bhtree-test.js

jsc/system.js: js/system.js
	$(CPP) js/system.js jsc/system.js

jsc/bhtree.js: js/bhtree.js
	$(CPP) js/bhtree.js jsc/bhtree.js




