# WhenGiantsCollide

A little JavaScript app simulating the collision of two giant
planets; see http://www.stefanom.org/wgc (a work in progress). It will
be in the same vein as [Super Planet Crash](http://www.stefanom.org/spc).

A sketch of what it will look like:
![sketch](https://raw.githubusercontent.com/stefano-meschiari/WhenGiantsCollide/master/img/sketch.png)

The package also contains JavaScript code that could be useful for
other physically-motivated simulations, including:

(1) Creating and updating an octree from a collection
of three-dimensional coordinates (js/bhtree.js).

(2) Computing the gravitational force among a collection of particles,
using the Barnes-Hut algorithm or a brute force direct sum (js/system.js).

(3) Calculate hydrodynamical quantities using a simple implementation
of the Smoothed Particle Hydrodynamics (SPH) algorithm (js/system.js).

(4) Evolve the system forward in time (js/evolve.js).

(5) Drawing a smooth rendering of the particles (js/draw.js), similar
to e.g. [SPLASH][1].

# bhtree.js
See [this article](http://arborjs.org/docs/barnes-hut) for an
explanation of octrees and the Barnes-Hut algorithm. You can see this
algorithm in action here:
[Interactive Barnes-Hut Tree](http://www.stefanom.org/wgc/test_tree.html),
and benchmark it here: [Barnes-Hut gravity benchmark](http://www.stefanom.org/wgc/test_gravity.html).

## The tree object
To create a new tree object:
```javascript
var tree = new BHTree();
```

To build the tree with an array of three-dimensional coordinates:
```javascript
tree.update(arr);
```
Each element of arr should be an array with three coordinates (X, Y,
Z). If the elements have at least 7 coordinates, then they are
taken to be (X, Y, Z, VX, VY, VZ, MASS) and each node has a
"mass" property that accumulates the mass of all the particles in the
subnodes.

To get the top node of the tree:
```javascript
var top = tree.tree();
```
returns the top node (see the next section for a description of the
node structure). 

To conditionally walk down the tree:
```javascript
tree.walk(function(t) {
  // t is the current node being examined;
  // return true if t should be opened (e.g. keep walking through its
  // descendants), false otherwise
});
```
The function passed to walk is called repeatedly until the tree has
been walked thoroughly. For an example of how to use the walk function, see the computeForce
function in js/system.js.

## The node object
Each node has the following fields:
* parent is a pointer to the parent node (null if this is the top node)
* type is one of BHTree.EMPTY (the node is empty), BHTree.PARTICLE
  (the node contains one particle, has no descendants), BHTree.NODE
  (the node has 8 descendants).
* descendants is an array of descendant nodes (there are 8 descendants).
* min are the minimum coordinates of the cube.
* width is the length of the side of the cube.
* com is an array of the (X, Y, Z) coordinates of the center of mass
  of the node.
* mass is the total mass of the particles contained in the node or its
  descendants.
* particleCount is the total count of particles in the node or its
  descendants.
* body is a pointer to the coordinates of the body attached to the
  node, if the node is of PARTICLE type.
* bodyIndex is the index of body (as it were in the array used to
  build the tree via tree.update).



# Compiling

Some of the JavaScript code (in the jsp/ folder) contains C macros,
used to inline code.

The .js code needs to be compiled into vanilla JavaScript through the
C preprocessor (/usr/bin/cpp, typically) and written in the js/ folder.

To compile the code, use the Makefile:
```
cd /path/to/downloaded/package
make
```


# Performance

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

Optimizing for V8: see http://wp.me/p1GL6x-mT


[1] http://users.monash.edu.au/~dprice/splash/about.html
