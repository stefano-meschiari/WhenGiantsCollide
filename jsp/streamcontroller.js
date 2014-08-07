"use strict";

if (typeof module !== 'undefined' && module.exports) {
    var _m = require("./math.js")._m;
}

if (!Date.now) {
  Date.now = function now() {
    return new Date().getTime();
  };
}


function StreamController(streamer, totalTime, frameRate) {
    this.streamer = streamer;
    this.frameRate = frameRate || 25;
    if (!totalTime) throw new Error("Specify the total time.");
    this.totalTime = totalTime;
    this.time = 0;
    this.startTime = 0;
    this.minimumNumber = 50;
    this.buffer = [];
    this.dtEstimator = [];
    this.streamer = streamer;
    this.streaming = true;
    this.millisPerTunit = null;
    this.needsMillisPerTunitEstimate = true;
};

StreamController.prototype.millisLeft = function() {
    if (this.millisPerTunit == null)
        return -1;
    return (this.totalTime - this.time) * this.millisPerTunit;
};

StreamController.prototype.push = function(o, time) {
    if (time === undefined)
        throw new Error("No time specified for new frame.");
    
    this.buffer.push(o);

    if (this.needsMillisPerTunitEstimate) {       
        if (this.dtEstimator.length < this.minimumNumber)
            this.dtEstimator.push([time, Date.now()]);
        if (this.dtEstimator.length == this.minimumNumber) {
            this.millisPerTunit = (this.dtEstimator[this.dtEstimator.length-1][1]-this.dtEstimator[0][1])/
                (this.dtEstimator[this.dtEstimator.length-1][0]-this.dtEstimator[0][0]);
            this.needsMillisPerTunitEstimate = false;            
        }
    } else if (this.streaming) {        
        if (this.isRealTime()) {
            this.streamer(this.buffer);
        }
    }

    this.time = time;
};

StreamController.prototype.reset = function() {
    this.dtEstimator = [];
    this.needsMillisPerTunitEstimate = true;
    this.streaming = false;
};

StreamController.prototype.bufferPercentage = function() {
    if (this.millisPerTunit === null || this.needsMillisPerTunitEstimate) 
        return 0;
    var realTimeLeft = (this.totalTime - this.time) * this.millisPerTunit;
    var realTimePlay = this.buffer.length/(this.frameRate)*1000;
    return (realTimePlay / realTimeLeft);
};

StreamController.prototype.millisToRealTime = function() {
    return (1-this.bufferPercentage()) * (this.totalTime - this.time) * this.millisPerTunit;
};

StreamController.prototype.isRealTime = function() {
    return (this.bufferPercentage() >= 1);
};

StreamController.prototype.done = function() {
    this.streamer(this.buffer);
};

if (typeof(exports) != "undefined")
    exports.StreamController = StreamController;
