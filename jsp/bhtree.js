

var BHTree = (function() {
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
                descendants:new Array(NSUB),
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

    for (var j = 0; j < CACHE_LENGTH; j++)
        nodeCache.push(createNode());
    
    function deleteNode(node) {
        node.type = EMPTY;
        node.mass = 0.;
        node.particleCount = 0;
        VSET3(node.com, 0, 0, 0);
        nodeCache.push(node);
    };

    function divide(node) {
        var mx = node.min[X];
        var my = node.min[Y];
        var mz = node.min[Z];
        var w = node.width;
        
        ASSERT(isFinite(mx), "A coordinate is not finite.");
        ASSERT(isFinite(w), "A coordinate is not finite.");

        var i = 0;
        
        for (var x = 0; x <= 1; x++)
            for (var y = 0; y <= 1; y++)
                for (var z = 0; z <= 1; z++) {
                    var n = makeNode();
                    VSET3(n.min, mx + 0.5 * x * w, my + 0.5 * y * w, mz + 0.5 * z * w);
                    n.width = 0.5*w;
                    n.parent = node;
                    n.type = EMPTY;
                    nodeList.push(n);
                    node.descendants[i] = n;
                    i++;
                }

        ASSERT(node.descendants.length == NSUB, "Wrong number of descendants.");        
    }
    
    function addParticle(particle, pIndex, node) {
        var i;
        LOG("Trying to add particle ", pIndex);
        
        // Node is empty, accept a particle
        if (node.type == EMPTY) {
            node.type = PARTICLE;
            node.body = particle;
            node.bodyIndex = pIndex;
            
            LOG("Node empty, accept particle ", pIndex);
        } else if (node.type == PARTICLE) {
            node.type = NODE;
            
            LOG("Node not empty, subdivide node");
            divide(node);
            for (i = 0; i < node.descendants.length; i++)
                if (CONTAINS(node.body, node.descendants[i].min, node.descendants[i].width)) {
                    LOG("Moving ", node.bodyIndex, node.body[X], node.body[Y], " to descendant #", i,
                       node.descendants[i].min[X], node.descendants[i].min[Y], node.descendants[i].min[Z],
                       node.descendants[i].min[X]+node.descendants[i].width, node.descendants[i].min[Y]+node.descendants[i].width,
                       node.descendants[i].min[Z]+node.descendants[i].width);
                    
                    addParticle(node.body, node.bodyIndex, node.descendants[i]);
                    break;
                }

            node.body = null;
            node.bodyIndex = -1;
        };

        node.mass += particle[MASS];
        node.particleCount += 1;
        
        VMUL(node.com, node.particleCount-1);
        VADD(node.com, node.com, particle);
        VMUL(node.com, 1./node.particleCount);
        
        if (node.type == NODE) {
            for (i = 0; i < node.descendants.length; i++)
                if (CONTAINS(particle, node.descendants[i].min, node.descendants[i].width)) {
                    LOG("Adding ", pIndex, particle[X], particle[Y], " to descendant #", i,
                       node.descendants[i].min[X], node.descendants[i].min[Y], node.descendants[i].min[Z],
                       node.descendants[i].min[X]+node.descendants[i].width, node.descendants[i].min[Y]+node.descendants[i].width,
                       node.descendants[i].min[Z]+node.descendants[i].width);
                    
                    addParticle(particle, pIndex, node.descendants[i]);
                    break;
                }
        }
        
    };
    
    var treeWalker = null;
    
    bhtree.update = function(particles) {        
        var i;
        for (i = 0; i < nodeList.length; i++)
            deleteNode(nodeList[i]);

        var max = new Float64Array(3);
        VSET(max, particles[0]);
        var min = new Float64Array(3);
        VSET(min, particles[0]);
        
        for (i = 1; i < particles.length; i++) {
            VMIN(min, min, particles[i]);
            VMAX(max, max, particles[i]);
        }
        
        tree = makeNode();
        nodeList = [tree];
        var width = Math.max(max[X]-min[X], max[Y]-min[Y], max[Z]-min[Z]);

        tree.min[X] = 0.5*(max[X]-min[X]) - 0.5*width + min[X];
        tree.min[Y] = 0.5*(max[Y]-min[Y]) - 0.5*width + min[Y];
        tree.min[Z] = 0.5*(max[Z]-min[Z]) - 0.5*width + min[Z];
        tree.width = width;

        tree.parent = null;

        for (i = 0; i < particles.length; i++) {
            addParticle(particles[i], i, tree);
        }

        LOG(nodeList.length);

        if (treeWalker == null)
            treeWalker = new Array(nodeList.length);
    };

    bhtree.walk = function(f) {
        var treeWalker_length = 1;
        treeWalker[0] = tree;

        while (treeWalker_length > 0) {
            treeWalker_length --;
            var n = treeWalker[treeWalker_length];
            
            if (n.type == EMPTY)
                continue;
            else {
                var openNode = f(n);
                if (n.type == NODE && openNode)
                    for (i = 0; i < NSUB; i++) {
                        treeWalker[treeWalker_length] = n.descendants[i];
                        
                        treeWalker_length++;
                    }
            }
        }
    };
    
    bhtree.tree = function() {
        return tree;
    };

    bhtree.size = function() {
        return nodeList.length;
    };

    bhtree.flat = function() {
        return nodeList;
    };
    
    bhtree.log = function() {
        console.log(tree);
    };

    bhtree.EMPTY = EMPTY;
    bhtree.PARTICLE = PARTICLE;
    bhtree.NODE = NODE;
    return bhtree;
});

if (typeof(exports) != "undefined")
    exports.BHTree = BHTree;
else
    this.BHTree = BHTree;
