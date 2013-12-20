;(function(exports){

	"use strict"

	var cereals = {},
		lastUid = 0,
		running = false,
		interval = 32; // ~30 fps, probably an older browser


// Compat

	var requestAnimationFrame = requestAnimationFrame
	                         || webkitRequestAnimationFrame
	                         || mozRequestAnimationFrame
	                         || msRequestAnimationFrame
	                         || oRequestAnimationFrame
	                         || requestTimeout;

	function requestTimeout(fn) {
		setTimeout(function(){ fn(Date.now()); }, interval)
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
		for (var k in cereals)
			cereals[k](time);
		requestAnimationFrame(frame);
	}

	function start(fallback) {
		if (fallback != null)
			interval = fallback;
		running = true;
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