"use strict";

function Pool(constructor, size) {
    if (!constructor)
        throw new Error("Specify a constructor.");
    size = size || 1000;
    this.pool = [];
    this.sizeIncrease = size;
    this.totalSize = size;
    this.constructor = constructor;
    
    for (var i = 0; i < size; i++)
        this.pool.push(constructor());
};

Pool.prototype.pop = function() {
    if (this.pool.length == 0) {
//        console.log("Increasing size, total size = " + this.totalSize);
        this.totalSize += this.sizeIncrease;
        for (var i = 0; i < this.sizeIncrease; i++)
            this.pool.push(this.constructor());
        return this.constructor();
    } else
        return this.pool.pop();
};

Pool.prototype.destroy = function(o) {
    this.pool.push(o);
};

Pool.prototype.drain = function() {
    this.pool = [];
};

Pool.prototype.size = function() {
    return this.pool.length;
};

if (typeof(exports) != "undefined")
    exports.Pool = Pool;
