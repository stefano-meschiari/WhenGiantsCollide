"use strict";

var isNode = typeof module !== 'undefined' && module.exports;

if (isNode) {
    var System = require('./system.js').System;
    var Units = require('./units.js').Units;
    var BHTree = require('./bhtree.js').BHTree;
    var Stellar = require('./stellar.js').Stellar;
    var _m = require('./math.js')._m;
    var Pool = require('./pool.js').Pool;
    var StreamController = require('./streamcontroller').StreamController;
} else {
    importScripts("vendor/underscore-min.js", "math.js?v=worker", "units.js?v=worker", "bhtree.js?v=worker", "system.js?v=worker", "pool.js?v=worker",
                 "streamcontroller.js?v=worker");
}


var onmessage = function(event) {
    var system, pool, streamer;
    var data = event.data;
    var tmax = data.tmax;
    var frameRate = data.frameRate;
    var dt = data.dt;
    
    system = System.unserialize(data.system);

    pool = new Pool(function() {
        return new Float64Array((NPHYS+1)*system.size());
    });

    streamer = new StreamController(function(buffer) {
        postMessage({
            type:'streaming',
            buffer:buffer
        });

        for (var i = 0; i < buffer.length; i++)
            pool.destroy(buffer[i]);
        
        buffer.length = 0;
    }, tmax, frameRate);

    system.useTimeStep_control = true;

    var coords = [X, Y, Z, TAG];
    
    while (system.t < tmax) {
        system.center();

        var xyz = pool.pop();
        system.toArray(xyz, coords);
        streamer.push(xyz, system.t);
        system.evolve(system.t + dt);
        
        system.center();
        
        if (!streamer.isRealTime())
            postMessage({
                type:'buffering',
                millisToRealTime:streamer.millisToRealTime(),
                millisLeft:streamer.millisLeft(),
                percentage:streamer.bufferPercentage()
            });

    }

    streamer.done();
    
    postMessage({
        type:'done'
    });
};

