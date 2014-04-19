Honeyloops
==========

Honeyloops is a micro library (less than 512 bytes gzipped) for debouncing and batching the execution of handlers on [frame rendering]. It falls back to timeouts on older browsers and has no external dependencies.

[frame rendering]: https://developer.mozilla.org/en/docs/Web/API/window.requestAnimationFrame


Quick start
-----------

Just include `honeyloops.js` or `honeyloops.min.js` in your page, and decorate the handlers that you want to be batched:

```javascript
var render = Honeyloops.batch(function(){
    $container.css({ ... });
});
```

...and done. What you get back is a promise of executing the handler during the next frame redraw, just once per frame.

You can now call `render` whenever you need, how many times you want, just like before – but it will only be executed once, batched along all your other handlers, during the next frame.

Call a handler directly, attach it directly to multiple DOM listeners, _change_ events, pass it around, it doesn't matter.


Usage guide
-----------

You can see Honeyloops as a central, globally available scheduler, so its usefulness shows when batching multiple handlers from various sources, as you can maintain a simple, decoupled architecture, while being sure that runs will be controlled.

```javascript
var renderNotifications = Honeyloops.batch(function(){
    // Process only a small chunk per frame.
    var nn = notifications.consume(5);
    if (nn.length) {
        views = nn.map(renderNotification);
        $notifications.append(views);
        // We may have more.
        renderNotifications();
    }
});

notifications.on('receive', renderNotifications);
```

If you just fan out from a single entry point (ie. a DOM listener), you may want to batch it directly:

```javascript
window.onscroll = Honeyloops.batch(function(event){
    updateBackground();
    updateNavbar();
});
```

You may call handlers during a run, and they will be scheduled on the next frame. For example, this is how you would accomplish a classic draw loop:

```javascript
var draw = Honeyloops.batch(function(elapsed){
    // Paint your things, in order, scaled to time slice.
    if (isRunning)
        draw(); // Draw again on next frame.
});

var isRunning = false;
function start() { isRunning = true; draw() }
function stop()  { isRunning = false }
```

Though if you only have a single handler you may still want to write your own loop using `requestAnimationFrame` directly.

You can of course mix and match:

```javascript
var updateCounter = Honeyloops.batch(function(value, prev){
    $counter.text(value);
    inflation += value - prev;
    inflateAnimation();
});

var inflateAnimation = Honeyloops.batch(function(elapsed){
    inflation = Math.max( 0.0, inflation - scale(deflation, elapsed) );
    $counter.css('transform', 'scale('+(1+inflation)+')');
    if (inflation > 0) inflateAnimation();
});
```

Many draw loops have to run each frame, but frames won't be requested until they are needed. You can keep this advantage by invoking handlers only when there, and architecting your code using a _consumer_ approach.


Compatibility
-------------

Honeyloops falls back to `setTimeout` for environments which do not have `requestAnimationFrame`. While there are differences (which are detailed in the source for the shim) they are abstracted away. Note, though, that the fallback scheduler will run at half speed.


Public interface
----------------

Honeyloops publishes a single namespace, `Honeyloops`, either on `window` or as `module.exports` for commonjs-style environments.

##### Honeyloops.batch( function handler(args..., elapsed), context )

Wraps the given handler into a promise of executing the handler only once during the next frame. You can optionally pass a context for binding.

Any argument given to the wrapper will be passed onto the wrapped function, with time elapsed since last frame as last argument. Subsequent calls will be ignored until the frame occurs.

If you call a batched handler inside another batched handler during a run, it will be scheduled for the next batch.


Possible further improvements
-----------------------------

- Helpers for looping
- Helpers for dirty checking
- Time scaling / priority
- Dependency ordering
- Profiling of handlers or main loop
- Things like `lastFrameTime` available on `Honeyloops`
- Before-frame/after-frame hooks
- Queue/consumer-style helpers


Changelog
---------

### v0.1.0

Initial version.


### v0.2.0

Rewritten from the ground up using a much simpler and lighter approach.