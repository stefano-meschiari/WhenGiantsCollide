





"use strict";

var AU = 1.4959787e13;
var MSUN = 1.98892e33;
var MJUP = 1.8986e30;
var MEARTH = 5.97219e27;
var RJUP = 7.1e9;
var RSUN = 6.96e10;
var REARTH = 6.3e8;

var GGRAV = 6.67384e-8;
var MIN_DISTANCE = 300 * RJUP/AU;

var DAY = 8.64e4;
var TWOPI = 6.2831853072e+00;
var SQRT_TWOPI = 2.5066282746e+00;
var K2  = ((GGRAV * MSUN * DAY * DAY) / (AU*AU*AU));
var YEAR = 31556926.;


var RUNIT = AU;
var MUNIT = MSUN;
var TUNIT = DAY;

// Simulation parameters

var x1 = 0;
var x2 = 100 * RJUP/RUNIT;
var R1 = RJUP/RUNIT;
var R2 = 0.5 * RJUP/RUNIT;


var BHTREE = (function() {
    var nodeCache = [];
    var nodeList = [];
    var theta = 0.5;

    var EMPTY = 0;
    var PARTICLE = 1;
    var NODE = 2;
    
    var bhtree = {};
    var p2node = [];
    var tree;

    function createNode() {
        return({
                body:null,
                bodyIndex:-1,
                parent:null,
                type:EMPTY,
                descendants:new Array(8),
                min:new Float64Array(3),
                width:0,
                com: new Float64Array(3),
                mass:0.,
                particleCount:0
        });
    }
    
    function makeNode() {
        if (nodeCache.length == 0) {
            return createNode();
        } else {
            return nodeCache.pop();
        }
    };

    for (var j = 0; j < 10000; j++)
        nodeCache.push(createNode());
    
    function deleteNode(node) {
        node.type = EMPTY;
        node.mass = 0.;
        node.particleCount = 0;
        { node.com[0]= 0; node.com[1]= 0; node.com[2]= 0; };
        nodeCache.push(node);
    };

    function divide(node) {
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
                    var n = makeNode();
                    { n.min[0]= mx + 0.5 * x * w; n.min[1]= my + 0.5 * y * w; n.min[2]= mz + 0.5 * z * w; };
                    n.width = 0.5*w;
                    n.parent = node;
                    nodeList.push(n);
                    node.descendants[i] = n;
                    i++;
                }

        {};        
    }
    
    function addParticle(particle, pIndex, node) {
        var i;
        {};
        
        // Node is empty, accept a particle
        if (node.type == EMPTY) {
            node.type = PARTICLE;
            node.body = particle;
            node.bodyIndex = pIndex;
            
            {};
        } else if (node.type == PARTICLE) {
            node.type = NODE;
            
            {};
            divide(node);
        };

        node.mass += particle[6];
        node.particleCount += 1;
        { node.com[0] =  node.com[0]+ particle[0]; node.com[1] =  node.com[1]+ particle[1]; node.com[2] =  node.com[2]+ particle[2]; };
        
        if (node.type == NODE) {
            for (i = 0; i < node.descendants.length; i++)
                if ((((particle[0] >=  node.descendants[i].min[0]) && (particle[0] <=  node.descendants[i].min[0]+ node.descendants[i].width)) && ((particle[1] >=  node.descendants[i].min[1]) && (particle[1] <=  node.descendants[i].min[1]+ node.descendants[i].width)) && ((particle[2] >=  node.descendants[i].min[2]) && (particle[2] <=  node.descendants[i].min[2]+ node.descendants[i].width)))) {
                    {};
                    
                    addParticle(particle, pIndex, node.descendants[i]);
                    break;
                }
        }
        
    };
    
    bhtree.theta = function(newTheta) {
        if (newTheta)
            theta = newTheta;
        return theta;
    };
    
    var indices;
    var distances;
    var treeWalker;
    var force;
    
    bhtree.init = function(particles) {
        indices = new Int32Array(particles.length);
        distances = new Float64Array(particles.length);
        force = new Float64Array(3 * particles.length);
        
        bhtree.update(particles);
    };

    bhtree.update = function(particles) {
        
        // Tree container
        var i;
        for (i = 0; i < nodeList.length; i++)
            deleteNode(nodeList[i]);

        var max = -1e20;
        var min = -max;
        
        for (i = 0; i < particles.length; i++) {
            max = Math.max(max, particles[i][0], particles[i][1], particles[i][2]);
            min = Math.min(min, particles[i][0], particles[i][1], particles[i][2]);            
        }
        {};

        tree = makeNode();
        nodeList = [tree];

        { tree.min[0]= min; tree.min[1]= min; tree.min[2]= min; };
        tree.width = max-min;
        
        tree.parent = null;

        for (i = 0; i < particles.length; i++) {
            addParticle(particles[i], i, tree);
        }
        {};

        treeWalker = new Array(nodeList.length);
    };

    
    bhtree.neighborsWithin = function(particle, d) {
        var treeWalker_length = 1;
        treeWalker[0] = tree;
        
        var d2 = d*d;
        var i;
        var idx = 0;
        
        while (treeWalker_length > 0) {
            treeWalker_length--;
            var n = treeWalker[treeWalker_length];
           
            if (n.type == EMPTY) {
                continue;
            } else {
                var dist2 = (((particle[0]- n.body[0])*(particle[0]- n.body[0])) + ((particle[1]- n.body[1])*(particle[1]- n.body[1])) + ((particle[2] -  n.body[2])*(particle[2] -  n.body[2])));
                if (dist2 < d2) {
                    distances[idx] = Math.sqrt(dist2);
                    indices[idx] = n.bodyIndex;
                    idx++;
                }
                if (n.type == NODE) {
                    for (i = 0; i < 8; i++) {
                        var min = n.descendants[i].min;
                        var w = n.descendants[i].width;
                        if ((((min[0]) <= ( particle[0]+ d) && (min[0]+ w) >= ( particle[0]- d)) && ((min[1]) <= ( particle[1]+ d) && (min[1]+ w) >= ( particle[1]- d)) && ((min[2]) <= ( particle[2]+ d) && (min[2]+ w) >= ( particle[2]- d)))) {
                            treeWalker[treeWalker_length] = n.descendants[i];
                            treeWalker_length++;
                        }
                    }
                }
            }
        }

        return [idx, indices, distances];
    };

    bhtree.forceAndNeightbors = function(particles) {
        for (var i = 0; i < particles.length; i++) {
            var f = force.subarray(i * 3, (i+1)*3);

            var treeWalker_length = 1;
            treeWalker[0] = tree;

            while (treeWalker_length > 0) {
                
            }
            
        }
    };

    bhtree.tree = function() {
        return tree;
    };

    bhtree.size = function() {
        return nodeList.length;
    };
    
    bhtree.log = function() {
        console.log(tree);
    };
    
    return bhtree;
})();

var SYSTEM = (function() {
    var system = {};
    
    var com = new Float64Array(10);
    var p = [];
    var f = [];
    var f1 = [];
    

    var grid;
    var gridn = 100;
    var force;

    system.init = function(N, M1, M2, x1, x2, R1, R2) {
        var i;
        
        for (i = 0; i < N; i++)
            p.push(new Float64Array(10));

        force = new Float64Array(10);
        
        // Use M1/(M1+M2) particles for the first planet
        var N1 = (M1/(M1+M2) * N)|0;
        for (i = 0; i < N1; i++) {
            p[i][9] = 0;
            p[i][0] = Math.random() * R1 + x1;
            p[i][1] = Math.random() * R1;
            p[i][2] = Math.random() * R1;
            p[i][6] = M1/N1;
        }

        
        for (i = N1; i < N; i++)
            p[i][9] = 1;

        {};
        {};
    };

    system.particles = function() {
        return p;
    };

    system.n2d = function() {
        var d = 0.1 * R1;
        var d2 = d*d;
        var i, j;
        var neighs = 0;
        for (i = 0; i < p.length; i++)
            for (j = 0; j < p.length; j++)
        {};
    };
    
    return system;
    
})();

_.benchmark = function(Nb, fun) {
    var d = +(new Date());
    for (var i = 0; i < Nb-1; i++)
        fun();
    console.log(fun());
    return (+(new Date())-d)/Nb;
};


if (typeof(exports) !== 'undefined') {
    exports.SYSTEM = SYSTEM;
    exports.BHTREE = BHTREE;
    exports.R1 = R1;
    exports.R2 = R2;
    exports.x1 = x1;
    exports.x2 = x2;
}

