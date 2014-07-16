NODE=/opt/local/bin/node --trace_exception
UGLIFYJS=uglifyjs -m -c -o
MODE=PROD
#MODE=DEBUG
CPP=cpp -nostdinc -undef -D$(MODE) -P -ansi -traditional-cpp -imacros jsp/defines.h

tree-test: js/bhtree_c.js js/system_c.js
	$(NODE) js/bhtree-test.js

js/system_c.js: jsp/system.js
	$(CPP) jsp/system.js js/system_c.js

js/bhtree_c.js: jsp/bhtree.js
	$(CPP) jsp/bhtree.js js/bhtree_c.js

clean:
	rm -f js/*_c.js
