;(function(exports){

	"use strict"

	const BASE_FRAME_TIME = 16; // 60 fps base tick

	var cereals = {},
		lastUid = 0,
		running = false,
		fpsRatio = 1,
		timeFraction = 0;


// Compat

	var requestAnimationFrame = requestAnimationFrame
	                         || webkitRequestAnimationFrame
	                         || mozRequestAnimationFrame
	                         || msRequestAnimationFrame
	                         || oRequestAnimationFrame
	                         || requestTimeout;

	function requestTimeout(fn) {
		function call(){ fn(Date.now()); };
		setTimeout(call, BASE_FRAME_TIME * fpsRatio);
	}


// Handlers

	function unique(fn) {
		if (fn.uid == null)
			fn.uid = lastUid++;
		return fn;
	}

	function register(fn, ctx) {
		if (!(unique(fn) in cereals))
			cereals[fn.uid] = function(time){
				return fn.call(ctx, time);
			};
	}

	function unregister(fn) {
		delete cereals[fn.uid];
	}


// Engine

	function frame(time) {
		if (!running) return;
		if (timeFraction++ % fpsRatio == 0)
			for (var k in cereals)
				cereals[k](time);
		requestAnimationFrame(frame);
	}

	function start(desiredFrameTime) {
		running = true;
		fpsRatio = 1;
		timeFraction = 0;
		if (desiredFrameTime != null)
			fpsRatio = Math.max(0, Math.round(desiredFrameTime / BASE_FRAME_TIME));
		requestAnimationFrame(frame);
	}

	function stop() {
		running = false;
	}


// Exports

	var Honeyloops = {
		register: register,
		unregister: unregister,
		start: start,
		stop: stop
	};

	if (typeof module !== 'undefined' && 'exports' in module)
		module.exports = Honeyloops;
	else
		exports.Honeyloops = Honeyloops;

})(this);