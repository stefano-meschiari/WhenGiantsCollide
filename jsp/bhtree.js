"use strict";

/*
 bhtree.js - version 0.1
 
 Stores a collection of 3D vectors in an octree data structure.
 It is used by system.js to compute both the gravitational force and
 the nearest neighbor for each point.

 */

if (typeof module !== 'undefined' && module.exports) {
    var _m = require("./math.js")._m;
}

ASSERT(_m);

function BHTree() {
    this.nodeCache = [];
    this.nodeList = [];
    

    for (var j = 0; j < BHTree.CACHE_LENGTH; j++)
        this.nodeCache.push(new Node());
 
    this.bhtree = {};
    this.p2node = [];
    this.treeWalker = null;
}

BHTree.EMPTY = 0;
BHTree.PARTICLE = 1;
BHTree.NODE = 2;
BHTree.CACHE_LENGTH = 4096;

BHTree.prototype._makeNode = function() {
    if (this.nodeCache.length == 0) {
        return new Node();
    } else {
        return this.nodeCache.pop();
    }
};

BHTree.prototype._deleteNode = function(node) {
    node.type = BHTree.EMPTY;
    node.mass = 0.;
    node.bodyIndex = -1;
    node.particleCount = 0;
    node.body = null;
    V3SET3(node.com, 0., 0., 0.);
    this.nodeCache.push(node);
};

BHTree.prototype._divide = function(node) {
    var mx = node.min[X];
    var my = node.min[Y];
    var mz = node.min[Z];
    var w = node.width;
    
    ASSERT(isFinite(mx), "A coordinate is not finite.");
    ASSERT(isFinite(w), "Width is not finite.");

    var i = 0;
    
    for (var x = 0; x <= 1; x++)
        for (var y = 0; y <= 1; y++)
            for (var z = 0; z <= 1; z++) {
                var n = this._makeNode();
                V3SET3(n.min, mx + 0.5 * x * w, my + 0.5 * y * w, mz + 0.5 * z * w);
                n.width = 0.5*w;
                n.parent = node;
                n.type = BHTree.EMPTY;
                this.nodeList.push(n);
                node.descendants[i] = n;
                i++;
            }

    ASSERT(node.descendants.length == NSUB, "Wrong number of descendants.");        
};
    
BHTree.prototype._addParticle = function(particle, pIndex, node) {
    var i;
    LOG("Trying to add particle ", pIndex);
    var added = false;
    
    // Node is empty, accept a particle
    if (node.type == BHTree.EMPTY) {
        node.type = BHTree.PARTICLE;
        node.body = particle;
        node.bodyIndex = pIndex;
        
        LOG("Node empty, accept particle ", pIndex);
    } else if (node.type == BHTree.PARTICLE) {
        node.type = BHTree.NODE;
        
        LOG("Node not empty, subdivide node");
        this._divide(node);
        for (i = 0; i < node.descendants.length; i++)
            if (CONTAINS(node.body, node.descendants[i].min, node.descendants[i].width)) {
                LOG("Moving ", node.bodyIndex, node.body[X], node.body[Y], " to descendant #", i,
                    node.descendants[i].min[X], node.descendants[i].min[Y], node.descendants[i].min[Z],
                    node.descendants[i].min[X]+node.descendants[i].width, node.descendants[i].min[Y]+node.descendants[i].width,
                    node.descendants[i].min[Z]+node.descendants[i].width);
                
                this._addParticle(node.body, node.bodyIndex, node.descendants[i]);
                break;
            }

        node.body = null;
        node.bodyIndex = -1;
    };

    var mass = 1.;
    if (particle.length > MASS)
        mass = particle[MASS];
    
    node.particleCount += 1;
    
    V3MUL(node.com, node.mass);
    node.com[X] += mass*particle[X];
    node.com[Y] += mass*particle[Y];
    node.com[Z] += mass*particle[Z];
    node.mass += mass;
    V3MUL(node.com, 1./node.mass);
    
    if (node.type == BHTree.NODE) {
        for (i = 0; i < node.descendants.length; i++)
            if (CONTAINS(particle, node.descendants[i].min, node.descendants[i].width)) {
                LOG("Adding ", pIndex, particle[X], particle[Y], " to descendant #", i,
                    node.descendants[i].min[X], node.descendants[i].min[Y], node.descendants[i].min[Z],
                    node.descendants[i].min[X]+node.descendants[i].width, node.descendants[i].min[Y]+node.descendants[i].width,
                    node.descendants[i].min[Z]+node.descendants[i].width);
                
                this._addParticle(particle, pIndex, node.descendants[i]);
                break;
            }
    }
    
};

BHTree.prototype.update = function(particles) {        
    var i;
    for (i = 0; i < this.nodeList.length; i++)
        this._deleteNode(this.nodeList[i]);

    var max = new DOUBLEARRAY(3);
    V3SET(max, particles[0]);
    var min = new DOUBLEARRAY(3);
    V3SET(min, particles[0]);
    
    for (i = 1; i < particles.length; i++) {
        V3MIN(min, min, particles[i]);
        V3MAX(max, max, particles[i]);
    }
    
    var tree = this._makeNode();
    this.nodeList = [tree];
    var SAFETY = 1+1e-4;
    var width = SAFETY*Math.max(max[X]-min[X], max[Y]-min[Y], max[Z]-min[Z]);

    tree.min[X] = 0.5*(max[X]-min[X]) - 0.5*width + min[X];
    tree.min[Y] = 0.5*(max[Y]-min[Y]) - 0.5*width + min[Y];
    tree.min[Z] = 0.5*(max[Z]-min[Z]) - 0.5*width + min[Z];
    tree.width = width;

    tree.parent = null;

    for (i = 0; i < particles.length; i++) {
        this._addParticle(particles[i], i, tree);
    }

    LOG(this.nodeList.length);

    if (this.treeWalker == null)
        this.treeWalker = [this.tree];
    this.tree = tree;
};

BHTree.prototype.walk = function(f, p1, p2, p3, p4, p5) {
    var treeWalker_length = 1;
    var treeWalker = this.treeWalker;
    treeWalker[0] = this.tree;
    
    while (treeWalker_length > 0) {
        treeWalker_length --;
        var n = treeWalker[treeWalker_length];
        var type = n.type;
        if (type == BHTree.EMPTY)
            continue;
        else {            
            var openNode = f(n, p1, p2, p3, p4, p5);
            if (type == BHTree.NODE && openNode) {
                for (var i = 0; i < NSUB; i++) {
                    if (n.descendants[i].type != BHTree.EMPTY) {
                        treeWalker[treeWalker_length] = n.descendants[i];
                        treeWalker_length++;
                    }
                }
            }
        }
    }
};
  
BHTree.prototype.tree = function() {
    return this.tree;
};

BHTree.prototype.size = function() {
    return this.nodeList.length;
};

BHTree.prototype.flat = function() {
    return this.nodeList;
};

function Node() {
    this.body = null;
    this.bodyIndex = -1;
    this.parent = null;
    this.type = BHTree.EMPTY;
    this.descendants = new Array(NSUB);
    this.min = new DOUBLEARRAY(3);
    this.width = 0.;
    this.com =  new DOUBLEARRAY(3);
    this.mass = 0.;
    this.particleCount = 0;
}

Node.prototype.log = function() {
    console.log('Point: ', _m.toArray(this.body));
    console.log('Body index: ', this.bodyIndex);
    console.log('Type: ', this.type);
    console.log('Mass: ', this.mass);
    console.log('COM: ', _m.toArray(this.com));
    console.log('Min: ', _m.toArray(this.min), '\n');
};

if (typeof(exports) != "undefined")
    exports.BHTree = BHTree;
