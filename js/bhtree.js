





"use strict";

/*
 bhtree.js - version 0.1
 
 Stores a collection of 3D vectors in an octree data structure.
 It is used by system.js to compute both the gravitational force and
 the nearest neighbor for each point.

 */


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
    node.particleCount = 0;
    { node.com[0]= 0; node.com[1]= 0; node.com[2]= 0; };
    this.nodeCache.push(node);
};

BHTree.prototype._divide = function(node) {
    var mx = node.min[0];
    var my = node.min[1];
    var mz = node.min[2];
    var w = node.width;
    
    {};
    {};

    var i = 0;
    
    for (var x = 0; x <= 1; x++)
        for (var y = 0; y <= 1; y++)
            for (var z = 0; z <= 1; z++) {
                var n = this._makeNode();
                { n.min[0]= mx + 0.5 * x * w; n.min[1]= my + 0.5 * y * w; n.min[2]= mz + 0.5 * z * w; };
                n.width = 0.5*w;
                n.parent = node;
                n.type = BHTree.EMPTY;
                this.nodeList.push(n);
                node.descendants[i] = n;
                i++;
            }

    {};        
};
    
BHTree.prototype._addParticle = function(particle, pIndex, node) {
    var i;
    {};
    
    // Node is empty, accept a particle
    if (node.type == BHTree.EMPTY) {
        node.type = BHTree.PARTICLE;
        node.body = particle;
        node.bodyIndex = pIndex;
        
        {};
    } else if (node.type == BHTree.PARTICLE) {
        node.type = BHTree.NODE;
        
        {};
        this._divide(node);
        for (i = 0; i < node.descendants.length; i++)
            if ((((node.body[0] >=  node.descendants[i].min[0]) && (node.body[0] <=  node.descendants[i].min[0]+ node.descendants[i].width)) && ((node.body[1] >=  node.descendants[i].min[1]) && (node.body[1] <=  node.descendants[i].min[1]+ node.descendants[i].width)) && ((node.body[2] >=  node.descendants[i].min[2]) && (node.body[2] <=  node.descendants[i].min[2]+ node.descendants[i].width)))) {
                {};
                
                


                this._addParticle(node.body, node.bodyIndex, node.descendants[i]);
                break;
            }

        node.body = null;
        node.bodyIndex = -1;
    };

    var mass = 1.;
    if (particle.length > 6)
        mass = particle[6];
    
    node.particleCount += 1;
    
    { node.com[0] *=  node.mass; node.com[1] *=  node.mass; node.com[2] *=  node.mass; };
    node.com[0] += mass*particle[0];
    node.com[1] += mass*particle[1];
    node.com[2] += mass*particle[2];
    node.mass += mass;
    { node.com[0] *=  1./node.mass; node.com[1] *=  1./node.mass; node.com[2] *=  1./node.mass; };
    
    if (node.type == BHTree.NODE) {
        for (i = 0; i < node.descendants.length; i++)
            if ((((particle[0] >=  node.descendants[i].min[0]) && (particle[0] <=  node.descendants[i].min[0]+ node.descendants[i].width)) && ((particle[1] >=  node.descendants[i].min[1]) && (particle[1] <=  node.descendants[i].min[1]+ node.descendants[i].width)) && ((particle[2] >=  node.descendants[i].min[2]) && (particle[2] <=  node.descendants[i].min[2]+ node.descendants[i].width)))) {
                {};
                
                


                this._addParticle(particle, pIndex, node.descendants[i]);
                break;
            }
    }
    
};
    
BHTree.prototype.update = function(particles) {        
    var i;
    for (i = 0; i < this.nodeList.length; i++)
        this._deleteNode(this.nodeList[i]);

    var max = new Float64Array(3);
    { max[0] =  particles[0][0]; max[1] =  particles[0][1]; max[2] =  particles[0][2]; };
    var min = new Float64Array(3);
    { min[0] =  particles[0][0]; min[1] =  particles[0][1]; min[2] =  particles[0][2]; };
    
    for (i = 1; i < particles.length; i++) {
        { min[0] = Math.min( min[0],  particles[i][0]); min[1] = Math.min( min[1],  particles[i][1]); min[2] = Math.min( min[2],  particles[i][2]);};
        { max[0] = Math.max( max[0],  particles[i][0]); max[1] = Math.max( max[1],  particles[i][1]); max[2] = Math.max( max[2],  particles[i][2]);};
    }
    
    var tree = this._makeNode();
    this.nodeList = [tree];
    var width = Math.max(max[0]-min[0], max[1]-min[1], max[2]-min[2]);

    tree.min[0] = 0.5*(max[0]-min[0]) - 0.5*width + min[0];
    tree.min[1] = 0.5*(max[1]-min[1]) - 0.5*width + min[1];
    tree.min[2] = 0.5*(max[2]-min[2]) - 0.5*width + min[2];
    tree.width = width;

    tree.parent = null;

    for (i = 0; i < particles.length; i++) {
        this._addParticle(particles[i], i, tree);
    }

    {};

    if (this.treeWalker == null)
        this.treeWalker = new Array(this.nodeList.length);
    this.tree = tree;
};

BHTree.prototype.walk = function(f, ctx) {
    var treeWalker_length = 1;
    this.treeWalker[0] = this.tree;

    while (treeWalker_length > 0) {
        treeWalker_length --;
        var n = this.treeWalker[treeWalker_length];
        
        if (n.type == BHTree.EMPTY)
            continue;
        else {
            var openNode = f(n, ctx);
            if (n.type == BHTree.NODE && openNode)
                for (i = 0; i < 8; i++) {
                    this.treeWalker[treeWalker_length] = n.descendants[i];
                    
                    treeWalker_length++;
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
    this.descendants = new Array(8);
    this.min = new Float64Array(3);
    this.width = 0;
    this.com =  new Float64Array(3);
    this.mass = 0.;
    this.particleCount = 0;
}


if (typeof(exports) != "undefined")
    exports.BHTree = BHTree;
else
    this.BHTree = BHTree;

