/*
Honeyloops.js v0.3.0 --
github.com/zenoamaro/honeyloops
*/

;(function(globals){
	'use strict';


	var nextBatch = {},        // Stores handlers batched for execution.
		pendingFrame = false,  // True if a frame has been requested.
		lastFrameTime = 0,     // Timestamp of last run.
		nextUid = 1;           // Next unique id to be produced.


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
	function batch(fn, ctx) {
		// Tag the function with unique id.
		var uid = tag(fn);
		// Produce a wrapper that queues the function for
		// batched execution with the given arguments.
		return function batched() {
			// Partially apply arguments to the handler.
			var args = Array.prototype.slice.call(arguments);
			function handler(elapsed) { fn.apply(ctx, args.concat(elapsed)) }
			// We are generating a new applied function each
			// time, tag them with the same uid so that they
			// will all be debounced correctly.
			tag(handler, uid); schedule(handler);
		};
	}


// Rendering and scheduling
// ------------------------

	/*
	Queues a handler for execution in the next batch, then
	requests a frame, unless already requested. Replaces all
	previous schedules for this handler or any other handler
	with the same tag.
	*/
	function schedule(fn) {
		// Add or replace.
		nextBatch[ tag(fn) ] = fn;
		// Request only if needed.
		if (!pendingFrame) {
			pendingFrame = true;
			requestAnimationFrame(frame);
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
		for (var k in handlers) {
			handlers[k](elapsed);
		}
		// Keep track of updated frame time.
		lastFrameTime = frameTime;
	}


// Utilities and shims
// -------------------

	/*
	Returns a unique id distinguishing the function. The same
	function will always return the same id. Functions will be
	tagged with a custom uid if provided as argument.

	Internally, this attaches a `uid` property to the function.
	*/
	function tag(fn, uid) {
		// Overwrite the uid with the custom one.
		if (uid) { fn.uid = uid }
		// Or generate a new one if needed.
		else if (!fn.uid) { fn.uid = nextUid++ }
		return fn.uid;
	}

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
		function handler(){ fn(Date.now()) }
		return setTimeout(handler, 32); // 32fps
	}

	// Try the official method and the various prefixed ones.
	// Fallback on the shimmed implementation.
	var requestAnimationFrame = globals.requestAnimationFrame
	                         || globals.webkitRequestAnimationFrame
	                         || globals.mozRequestAnimationFrame
	                         || requestAnimationFrameShim;


// Exports
// -------

	// Namespace for the public exports.
	var Honeyloops = {
		tag: tag,
		batch: batch,
		schedule: schedule,
		frame: frame,
		requestAnimationFrameShim: requestAnimationFrameShim
	};

	// Export as a CommonJS module or bind on the globals.
	if (typeof module !== 'undefined' && 'exports' in module) {
		module.exports = Honeyloops;
	} else {
		globals.Honeyloops = Honeyloops;
	}


})(this);