/*
Honeyloops.js v0.2.0 --
github.com/zenoamaro/honeyloops
*/

;(function(exports){
	"use strict"


	// Namespace for the public exports.
	var Honeyloops = {};

	var nextBatch = {},        // Stores handlers batched for execution.
		pendingFrame = false,  // True if a frame has been requested.
		lastFrameTime = 0,     // Timestamp of last run.
		lastUid = 0;           // Last unique id produced.


	/*
	Wraps the given function so that it will only be executed
	during frame redraws. Optionally, pass a context to bind.

	Arguments passed to the wrapper will be proxied to the
	wrapped function when it runs, with the time since last
	execution stitched at the end.

	No more than one execution of the same function will be
	allowed per frame, and subsequent calls will be ignored.

	When called during a frame, the call will be scheduled for
	execution in the next batch instead.
	*/
	Honeyloops.batch = function(fn, ctx) {
		// Tag function with unique id so we can index it.
		var uid = lastUid++;
		// Produce a wrapper that enqueues the function for
		// execution with given arguments if it wasn't already.
		return function batched() {
			var args = Array.prototype.slice.call(arguments);
			schedule(uid, function (elapsed) {
				fn.apply(ctx, args.concat([ elapsed ]))
			});
		}
	}


// Rendering and scheduling
// ------------------------

 	/*
	Inserts a handler into the next execution batch, indexed by
	given uid, unless already scheduled in the batch, then
	schedules a frame for execution, unless already requested.
	*/
	function schedule(uid, fn) {
		if (!(uid in nextBatch))
			nextBatch[uid] = fn;
		if (!pendingFrame) {
			requestAnimationFrame(frame);
			pendingFrame = true;
		}
	}

	/*
	Executes the batch of handlers
	*/
	function frame(frameTime) {
		// Steal the current execution queue, and switch it with
		// a new one so that calls from handlers will be queued.
		var handlers = nextBatch; nextBatch = {};
		// Calculate time since last frame.
		var elapsed = frameTime - lastFrameTime;
		// We are taking care of this frame, so allow another
		// frame to be requested from inside the handlers.
		pendingFrame = false;
		// Replay each call with its own context and arguments.
		for (var k in handlers)
			handlers[k](elapsed);
		// Keep track of updated frame time.
		lastFrameTime = frameTime;
	}


// Shims
// -----

	/*
	Shim of `requestAnimationFrame` for older browsers.

	Will schedule the execution of a handler in 32ms, which is
	roughly the duration of a frame at 30fps, which is half of
	what `requestAnimationFrame` provides, as a compromise
	between consumption and responsivity on slower systems.

	The handler will be passed the current time in ms. Note
	that, unlike `requestAnimationFrame`, this timestamp is
	relative from _EPOCH_ and not _navigation start_, but this
	is good enough for what we need.

	Note also that the scheduling done by this shim is very
	naive: it will always schedule a run 32ms from now, and the
	onus of actual batching is on the caller.
	*/
	function requestAnimationFrameShim(fn) {
		function handler(){ fn(Date.now()) };
		return setTimeout(handler, 32); // 32fps
	}

	// Try the official method and the various prefixed ones.
	// Fallback on the shimmed implementation.
	var requestAnimationFrame = window.requestAnimationFrame
	                         || window.webkitRequestAnimationFrame
	                         || window.mozRequestAnimationFrame
	                         || requestAnimationFrameShim;


// Exports
// -------

	// Export as a CommonJS module or bind on the globals.

	if (typeof module !== 'undefined' && 'exports' in module)
		module.exports = Honeyloops;
	else
		exports.Honeyloops = Honeyloops;


})(this);