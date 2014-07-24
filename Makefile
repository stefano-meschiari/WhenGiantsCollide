NODE=/opt/local/bin/node --trace_exception
UGLIFYJS=uglifyjs -m -c -o
MODE=PROD
#MODE=DEBUG
CPP=/usr/local/bin/cpp -nostdinc -undef -D$(MODE) -P -std=gnu99 -C -imacros jsp/defines.h

all: js/bhtree.js js/system.js js/math.js

js/system.js: jsp/system.js
	$(CPP) jsp/system.js js/system.js

js/bhtree.js: jsp/bhtree.js
	$(CPP) jsp/bhtree.js js/bhtree.js

js/math.js: jsp/math.js
	$(CPP) jsp/math.js js/math.js

clean:
	rm -f js/bhtree.js js/system.js js/math.js
