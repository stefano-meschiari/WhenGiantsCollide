var X = 0;
var Y = 1;
var Z = 2;

var TreeDemo2D = (function() {
    var treeDemo2D = {};
    var p = [];
    var tree;
    var canvas;
    
    treeDemo2D.init = function(canv, N) {
        tree = BHTree();
        canvas = canv;

        var n = 0;
        var f = function() {
            if (n == N)
                return;
            treeDemo2D.add(Math.random() * canvas.width,
               Math.random() * canvas.height, 0.);
            n++;
            _.delay(f, 40);
        };
        _.delay(f, 40);
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

    function redraw() {
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (p.length == 0) {
            return;
        }

        var flat = tree.flat();
        ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
        
        for (i = 0; i < flat.length; i++) {
            ctx.fillRect(flat[i].min[X], flat[i].min[Y],
                          flat[i].width, flat[i].width);
            ctx.strokeRect(flat[i].min[X], flat[i].min[Y],
                          flat[i].width, flat[i].width);
            console.log(flat[i].min[X], flat[i].min[Y], flat[i].width);
        }

        ctx.fillStyle = "rgb(0, 0, 0)";
        for (i = 0; i < p.length; i++) {
            ctx.beginPath();
            ctx.arc(p[i][X], p[i][Y], 2, 0, 2*Math.PI);
            ctx.fill();
        }
            
    }
    
    return(treeDemo2D);
});

window.TreeDemo2D = TreeDemo2D;
