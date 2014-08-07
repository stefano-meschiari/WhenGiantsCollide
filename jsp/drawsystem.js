"use strict";

DrawSystem.NBODY = 0;
DrawSystem.SPH = 1;

function DrawSystem(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.type = DrawSystem.NBODY;
    this.ncoords = NPHYS+1;

    this.background = '#28211C';

    this.colors = ['rgba(172, 65, 66, 0.6)', 'rgba(244, 191, 117, 0.6)'];
    this.dotSize = 6;
    
    this.buffer = null;
    this.width = canvas.width;
    this.height = canvas.height;
    this.aspectRatio = canvas.width/canvas.height;
    this.center = [Math.floor(this.width/2), Math.floor(this.height/2)];
    this.zoom = 1;
    this.arrows = [];
    
    this.setView([-10, 10]);
}

DrawSystem.prototype.update = function(buffer) {
    
    buffer = buffer || this.buffer;
    var canvas = this.canvas;
    var ctx = this.ctx;
    var c = this.center;
    var v = this.view;
    var z = 1/this.zoom;
    var A = this.A;
    var dotSize = this.dotSize;

    ctx.fillStyle = this.background;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();

    if (buffer == null)
        return;
    
    if (this.type == DrawSystem.NBODY) {
        for (var i = 0; i < buffer.length; i+= this.ncoords) {
            if (buffer[i+X] < z*v[0] || buffer[i+X] > z*v[1] || buffer[i+Y] < z*v[0] || buffer[i+Y] > z*v[1])
                continue;
            var x = Math.floor(buffer[i+X]*A+c[0]);
            var y = Math.floor(buffer[i+Y]*A+c[1]);
            ctx.fillStyle = this.colors[buffer[i+NPHYS]];            
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, 2*Math.PI);
            ctx.fill();
        };
    }

    if (this.arrows.length > 0)
        this.drawArrow();
    this.drawCross();
    this.buffer = buffer;
    ctx.restore();
};

DrawSystem.prototype.drawCross = function() {
    var ctx = this.ctx;
    var c = this.center;
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(c[0]-5, c[1]);
    ctx.lineTo(c[0]+5, c[1]);
    ctx.moveTo(c[0], c[1]-5);
    ctx.lineTo(c[0], c[1]+5);
    ctx.stroke();
};

DrawSystem.prototype.addArrow = function(arrow) {
    this.arrows.push(arrow);
    this.update();
};

DrawSystem.prototype.clearArrows = function() {
    this.arrows = [];
    this.update();
};

DrawSystem.prototype.drawArrow = function() {
    if (this.arrows.length == 0)
        return;
    
    var ctx = this.ctx;
    var c = this.center;
    var A = this.A;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    for (var i = 0; i < this.arrows.length; i++) {
        var arr = this.arrows[i];
        ctx.beginPath();
        ctx.moveTo(arr[0]*A + c[0], arr[1]*A + c[1]);
        ctx.lineTo(arr[2]*A + c[0], arr[3]*A + c[1]);
        ctx.stroke();
    }
    
    ctx.lineWidth = 1;

};

DrawSystem.prototype.setView = function(view) {
    this.view = [view[0], view[1], view[0]/this.aspectRatio, view[1]/this.aspectRatio];
    this.A = this.zoom * this.canvas.width/(view[1]-view[0]);
    this.update();
};

DrawSystem.prototype.setZoom = function(z) {
    this.zoom = z;
    this.A = this.zoom * this.canvas.width/(this.view[1]-this.view[0]);    
    this.update();
};

DrawSystem.prototype.zoomIn = function() {
    var z = this.zoom*2;
    if (z > 1) z = Math.round(z);
    this.setZoom(z);
};

DrawSystem.prototype.zoomOut = function() {
    this.setZoom(0.5*this.zoom);
};
