NODE=/opt/local/bin/node --trace_exception
UGLIFYJS=uglifyjs -m -c -o
MODE=PROD
#MODE=DEBUG
CPP=cpp -nostdinc -undef -D$(MODE) -P -ansi -traditional-cpp -C -imacros jsp/defines.h

all: js/bhtree.js js/system.js

js/system.js: jsp/system.js
	$(CPP) jsp/system.js js/system.js

js/bhtree.js: jsp/bhtree.js
	$(CPP) jsp/bhtree.js js/bhtree.js

clean:
	rm -f js/bhtree.js js/system.js
