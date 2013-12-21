Honeyloops
==========

Honeyloops is a micro library (422 bytes gzipped) for batching the execution of handlers on [frame rendering](https://developer.mozilla.org/en/docs/Web/API/window.requestAnimationFrame). It supports time scaling and falls back to timeouts on older browsers.

Include `honeyloops.js` or `honeyloops.min.js` in your page, and register the handlers that you want to be run during the next frame rendering:

```javascript
Honeyloops.register(function(){
    if (this.hasChanged) {
        this.render();
        this.hasChanged = false;
    }
}, this);
```

You don't want your render called on each frame, so check if you really need to apply any updates and return early, so that the price of calling is low.

Honeyloops are best served with selective data updates. Popular micro framework Backbone, for example, provides you with a _change_ event and ways to detect actual changes to data, which you can use to decide when to render.

Start the request loop:

```javascript
Honeyloops.start()
```

Optionally, if you have relaxed responsivity requirements, or are scaling down to slower browser or devices, pass your desired frame interval as argument to `start()` and Honeyloops loosely adhere -- it will round it to multiples of 16, which is the default value and produces a speed 60fps.


Public interface
----------------

### Honeyloops.register( function handler, context )

Register a function as handler to be run on the next frame. This won't register the same handler twice. Optionally pass a context for binding.

### Honeyloops.unregister( [function handler] )

Unregister a handler, so it won't execute during a frame anymore. If called without a handler, this unregisters all handlers.

### Honeyloops.start( [desiredFrameTime] )

Starts the frame request loop, optionally matching a desired frame rate, which will be rounded to an even division of time.

If called when the engine is running, it will simply speed the already running loop to the new desired frame rate.

### Honeyloops.stop()

Stops the engine so that there won't be additional runs.

### Honeyloops.frame()

Called on every occurence of a frame.

It itself calls each registered handler, passing the current timestamp as argument. Frames will actually be run only when falling on the given speed divisor (ie. half of the time).

It can be invoked manually, in which case a frame will be rendered regardless of engine status or time division.
