"use strict";

var TreeDemo2D = (function(canv, N) {
    var treeDemo2D = {};
    var p = [];
    var tree;
    var canvas;
    var drawTree = true;

    tree = new BHTree();
    canvas = canv;
    
    treeDemo2D.addRandom = function(N) {
        
        var n = 0;
        var f = function() {
            if (n == N)
                return;
            treeDemo2D.add(Math.random() * canvas.width,
               Math.random() * canvas.height, 0.);
            n++;
            _.delay(f, 100);
        };
        _.delay(f, 100);
    };
    
    treeDemo2D.add = function(x, y, z) {
        p.push([x, y, z]);
        tree.update(p);
        redraw();
    };

    treeDemo2D.clear = function() {
        p = [];
        redraw();
    };

    treeDemo2D.toggleDrawTree = function() {
        drawTree = !drawTree;
        redraw();
    };

    function redraw() {
        var ctx = canvas.getContext('2d');
        var i;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "rgb(0, 0, 0)";
        for (i = 0; i < p.length; i++) {
            ctx.beginPath();
            ctx.arc(p[i][X], p[i][Y], 2, 0, 2*Math.PI);
            ctx.fill();
        }
        
        if (p.length < 2 || !drawTree) {
            return;
        }

        var flat = tree.flat();
        ctx.fillStyle = "rgba(255, 0, 0, 0.05)";
        
        for (i = 0; i < flat.length; i++) {
            if (flat[i].min[Z]+flat[i].width < 0 || flat[i].min[Z] > 0)
                continue;
            ctx.fillRect(flat[i].min[X], flat[i].min[Y],
                          flat[i].width, flat[i].width);
            ctx.strokeRect(flat[i].min[X], flat[i].min[Y],
                          flat[i].width, flat[i].width);
        }

        
            
    }
    
    return(treeDemo2D);
});

