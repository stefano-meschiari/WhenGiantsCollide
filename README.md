WhenGiantsCollide
=================
A little JavaScript app simulating the collision of two giant
planets with the SPH algorithm.

Compiling
=========
Some of the JavaScript code (in the jsp/ folder) contains C macros. The .js code
needs to be compiled into vanilla JavaScript through the C preprocessor (/usr/bin/cpp, typically) and
written in the js/ folder.

To compile the code, use the Makefile (i.e. cd into the folder and
type make).

Performance
===========
This section contains some of my notes on achieving the best
performance possible for the simulation.

Macros usage: I'm using macros to manually inline some expressions
that are evaluated in a tight loop. While I'm sure that JIT
interpreters will eventually inline those function calls away, I'm trying to
minimize the amount of work for the interpreter. I will do some
benchmarks in the future to verify if it's worth to add a compilation
step, and revert them to functions otherwise.

Pre-allocation: Node objects (used in the octree) are pre-allocated en
masse and reused at each tree rebuilding step.
