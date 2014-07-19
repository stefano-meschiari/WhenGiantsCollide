







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
                    n.type = EMPTY;
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
            for (i = 0; i < node.descendants.length; i++)
                if ((((node.body[0] >=  node.descendants[i].min[0]) && (node.body[0] <=  node.descendants[i].min[0]+ node.descendants[i].width)) && ((node.body[1] >=  node.descendants[i].min[1]) && (node.body[1] <=  node.descendants[i].min[1]+ node.descendants[i].width)) && ((node.body[2] >=  node.descendants[i].min[2]) && (node.body[2] <=  node.descendants[i].min[2]+ node.descendants[i].width)))) {
                    {};
                    
                    


                    addParticle(node.body, node.bodyIndex, node.descendants[i]);
                    break;
                }

            node.body = null;
            node.bodyIndex = -1;
        };

        node.mass += particle[6];
        node.particleCount += 1;
        
        { node.com[0] *=  node.particleCount-1; node.com[1] *=  node.particleCount-1; node.com[2] *=  node.particleCount-1; };
        { node.com[0] =  node.com[0]+ particle[0]; node.com[1] =  node.com[1]+ particle[1]; node.com[2] =  node.com[2]+ particle[2]; };
        { node.com[0] *=  1./node.particleCount; node.com[1] *=  1./node.particleCount; node.com[2] *=  1./node.particleCount; };
        
        if (node.type == NODE) {
            for (i = 0; i < node.descendants.length; i++)
                if ((((particle[0] >=  node.descendants[i].min[0]) && (particle[0] <=  node.descendants[i].min[0]+ node.descendants[i].width)) && ((particle[1] >=  node.descendants[i].min[1]) && (particle[1] <=  node.descendants[i].min[1]+ node.descendants[i].width)) && ((particle[2] >=  node.descendants[i].min[2]) && (particle[2] <=  node.descendants[i].min[2]+ node.descendants[i].width)))) {
                    {};
                    
                    


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
        { max[0] =  particles[0][0]; max[1] =  particles[0][1]; max[2] =  particles[0][2]; };
        var min = new Float64Array(3);
        { min[0] =  particles[0][0]; min[1] =  particles[0][1]; min[2] =  particles[0][2]; };
        
        for (i = 1; i < particles.length; i++) {
            { min[0] = Math.min( min[0],  particles[i][0]); min[1] = Math.min( min[1],  particles[i][1]); min[2] = Math.min( min[2],  particles[i][2]);};
            { max[0] = Math.max( max[0],  particles[i][0]); max[1] = Math.max( max[1],  particles[i][1]); max[2] = Math.max( max[2],  particles[i][2]);};
        }
        
        tree = makeNode();
        nodeList = [tree];
        var width = Math.max(max[0]-min[0], max[1]-min[1], max[2]-min[2]);

        tree.min[0] = 0.5*(max[0]-min[0]) - 0.5*width + min[0];
        tree.min[1] = 0.5*(max[1]-min[1]) - 0.5*width + min[1];
        tree.min[2] = 0.5*(max[2]-min[2]) - 0.5*width + min[2];
        tree.width = width;

        tree.parent = null;

        for (i = 0; i < particles.length; i++) {
            addParticle(particles[i], i, tree);
        }

        {};

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
                    for (i = 0; i < 8; i++) {
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

