;(function(exports){
	"use strict"


	var BASE_FRAME_TIME = 16;  // We assume a 60 fps frame tick

	var cereals = {},       // Indexed store for handlers.
		lastUid = 0,        // Last generated unique ID
		timeScale = 1,      // Divide the base fps speed by this ratio
		timeFraction = 0,   // Loop counter to implement fps division
		isRunning = false;  // True if the loop is running.


// Polyfilling
// -----------

	// Try the official method and the various prefixed ones.
	// Fallback on the timeout implementation.
	var requestAnimationFrame = requestAnimationFrame
	                         || webkitRequestAnimationFrame
	                         || mozRequestAnimationFrame
	                         || msRequestAnimationFrame
	                         || oRequestAnimationFrame
	                         || requestTimeout;

	// Call the frame function at the next frame, passing
	// the current timestamp as argument. We need a time
	// so calculate it by normalizing the time scale factor.
	function requestTimeout(fn) {
		function call(){ fn( Date.now() ); };
		setTimeout(call, BASE_FRAME_TIME * timeScale);
	}


// Handlers
// --------

	// Attaches a univoque ID to a given function in order
	// to recognize it and index it in hashes.
	function unique(fn) {
		if (fn.uid == null)
			fn.uid = lastUid++;
		return fn;
	}

	// Register a function as handler to be run on the next frame.
	// This won't register the same handler twice. Optionally pass a
	// context for binding.
	function register(fn, ctx) {
		cereals[unique(fn).uid] = function(time){
			return fn.call(ctx, time);
		};
	}

	// Unregister a handler, so it won't execute during a frame
	// anymore. If called without a handler, this unregisters all
	// handlers.
	//
	// REVIEW: Won't this aggravate debugging of "undefined" bugs?
	function unregister(fn) {
		if (fn == null)
			cereals = {};
		else
			delete cereals[fn.uid];
	}


// Engine
// ------

	// Called on every occurence of a frame.
	//
	// It itself calls each registered handler, passing the current
	// timestamp as argument. Frames will actually be run only when
	// falling on the given speed divisor (ie. half of the time).
	//
	// It can be invoked manually, in which case a frame will be
	// rendered regardless of engine status or time division.
	function frame(time) {
		// If we haven't been passed a frame (e.g. `frame` has been
		// called by itself), fake a new timestamp.
		if (time == null)
			time = Date().now;
		// Execute on the time division if we're inside the loop.
		// If the engine is stopped, produce a frame regardless.
		//
		// REVIEW: This uses an incrementing counter. Look onto
		//         alternative approaches and try to gather if this
		//         is actually the most efficient or not.
		if (!isRunning || timeFraction++ % timeScale == 0)
			for (var k in cereals)
				cereals[k]( time );
		// If the engine is not running anymore, don't request any
		// more frames, thus effectively halting the loop.
		if (isRunning)
			requestAnimationFrame(frame);
	}

	// Starts the frame request loop, optionally matching a desired
	// frame rate, which will be rounded to an even division of time.
	//
	// If called when the engine is running, it will simply speed the
	// already running loop to the new desired frame rate.
	function start(desiredFrameTime) {
		timeScale = 1;
		timeFraction = 0;
		// The ratio is based on the assumed 60fps speed that
		// `requestAnimationFrame` gives us. It is used as divisor
		// of the desired speed to get an even slicing of time and
		// implement it with a simple counter. We also cap the scale
		// so that we won't ever run faster than the base speed.
		if (desiredFrameTime != null)
			timeScale = Math.max( 1, Math.round(desiredFrameTime / BASE_FRAME_TIME) );
		// Accumulated calls to `requestAnimationFrame` will be
		// ignored by the browser, but would cause undesired extra
		// frames when using the timeout fallback.
		if (!isRunning) {
			isRunning = true;
			requestAnimationFrame(frame);
		}
	}

	// Stops the engine so that there won't be additional runs.
	function stop() {
		isRunning = false;
	}


// Exports
// -------

	// Public interface

	var Honeyloops = {
		register: register,
		unregister: unregister,
		frame: frame,
		start: start,
		stop: stop
	};

	// Export as a CommonJS module or bind on the globals.

	if (typeof module !== 'undefined' && 'exports' in module)
		module.exports = Honeyloops;
	else
		exports.Honeyloops = Honeyloops;


})(this);