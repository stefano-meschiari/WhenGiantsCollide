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
    system.sortBy(Z);

    var coords = [X, Y, Z, TAG];
    var last = null;
    var interpolatedFrames = 4;
    
    while (system.t < tmax) {
        system.center();

        var xyz = pool.pop();
        system.toArray(xyz, coords);

        if (last != null && interpolatedFrames > 0) {
            var i_n = 0;
            for (var i = 0; i < interpolatedFrames-1; i++) {
                var xyz_i = pool.pop();
                i_n += 1./interpolatedFrames;
                for (var j = 0; j < xyz.length; j+=coords.length) {
                    for (var k = 0; k < coords.length; k++)
                        xyz_i[j+k] = i_n * (xyz[j+k]-last[j+k]) + last[j+k];
                }
                streamer.push(xyz_i, system.t - (1.-i_n) * dt);
            }
        }
        
        streamer.push(xyz, system.t);

        system.evolve(system.t + dt);
        
        system.center();
        
        last = xyz;
        
        if (!streamer.isRealTime() )
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

