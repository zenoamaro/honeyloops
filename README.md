Honeyloops ![](https://travis-ci.org/zenoamaro/honeyloops.svg?branch=master)
============================================================================

Honeyloops is a micro library (less than 512 bytes gzipped) for batching and scheduling the execution of handlers on [frame rendering]. It falls back to timeouts on older browsers, and has no external dependencies.

[frame rendering]: https://developer.mozilla.org/en/docs/Web/API/window.requestAnimationFrame

  1. [Quick start](#quick-start)
  2. [Usage guide](#usage-guide)
  3. [API reference](#api-reference)
  4. [Building and testing](#building-and-testing)
  5. [Compatibility](#compatibility)
  6. [Roadmap](#roadmap)
  7. [Changelog](#changelog)
  8. [License](#license)


Quick start
-----------
Include `honeyloops.js` or `honeyloops.min.js` in your page, or `require('honeyloops')` when on node.js, and decorate the handlers that you want to be batched:

~~~js
var render = Honeyloops.batch(function(){
    $container.css({ ... });
});
~~~

...and done. What you get back is a promise of executing the handler during the next frame redraw, just once per frame.

You can now call `render` whenever you need, how many times you want, just like before – but it will only be executed once, batched along all your other handlers, during the next frame.

Call a handler directly, attach it directly to multiple DOM listeners, _change_ events, pass it around, it doesn't matter.


Usage guide
-----------
You can see Honeyloops as a central, globally available scheduler, so its usefulness shows when batching multiple handlers from various sources, as you can maintain a simple, decoupled architecture, while being sure that runs will be controlled.

~~~js
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
~~~

If you just fan out from a single entry point (ie. a DOM listener), you may want to batch it directly:

~~~js
window.onscroll = Honeyloops.batch(function(event){
    updateBackground();
    updateNavbar();
});
~~~

You may call handlers during a run, and they will be scheduled on the next frame. For example, this is how you would accomplish a classic draw loop:

~~~js
var draw = Honeyloops.batch(function(elapsed){
    // Paint your things, in order, scaled to time slice.
    if (isRunning)
        draw(); // Draw again on next frame.
});

var isRunning = false;
function start() { isRunning = true; draw() }
function stop()  { isRunning = false }
~~~

Though if you only have a single handler you may still want to write your own loop using `requestAnimationFrame` directly.

You can of course mix and match:

~~~js
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
~~~

Many draw loops have to run each frame, but frames won't be requested until they are needed. You can keep this advantage by invoking handlers only when there, and architecting your code using a _consumer_ approach.


API reference
-------------
Honeyloops publishes a single namespace, `Honeyloops`, either on `window` or as `module.exports` for commonjs-style environments.


### Honeyloops.schedule

    Honeyloops.schedule( function handler(ms elapsed) )

Schedules the execution of the given handler before the next animation frame. Handlers will be batched so they are executed together, and debounced so that each handler will only run once.

The handler will be passed the time elapsed since the last frame. If the handler is called again during a run, it will be scheduled for the next batch. 

Scheduling a handler will replaces all previous schedules for this handler or any other handler with the same tag. See the documentation for [tag](#honeyloopstag) below on how to group different handlers together.


### Honeyloops.batch

    Honeyloops.batch( function handler(any args..., ms elapsed), [any context] ) -> function

Wraps the given handler into a promise of executing the handler only once during the next frame. You can optionally pass a context for binding.

Any argument given to the wrapper will be passed to the wrapped function, with the time elapsed since last frame as the last argument. If the handler is called again during a run, it will be scheduled for the next batch.

Scheduling a handler will replaces all previous schedules for this handler or any other handler with the same tag. See the documentation for [tag](#honeyloopstag) below on how to group different handlers together. Note that you should tag handlers _before_ passing them to `batch()`.


### Honeyloops.tag

    Honeyloops.tag( function handler, [scalar tag] ) -> uid

Returns the unique id distinguishing a handler. Identical handlers will always return the same id.

If given a custom tag, it will replace that handler's original tag, putting it in the same debouncing bucket as other handlers with the same tag.

~~~js
var uid = Honeyloops.tag(myHandler);
Honeyloops.tag(myOtherHandler, uid);
Honeyloops.tag(yetAnotherHandler, uid);
~~~


Building and testing
--------------------
You can run the automated test suite:

    $ npm test

And build a minificated version of the source:

    $ npm run build

More tasks are available on the [Makefile](Makefile):

    lint: lints the source
    spec: runs the test specs
    coverage: runs the code coverage test
    test: lint, spec and coverage threshold test
    build: builds the minified version


Compatibility
-------------
Honeyloops falls back to `setTimeout` for environments which do not have `requestAnimationFrame`. While there are differences (which are detailed in the source for the shim) they are abstracted away. Note, though, that the fallback scheduler will run at half speed.


Roadmap
-------
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
#### next
- BREAKING: Scheduling a handler now replaces its previous schedules.
- Published more methods on the public interface.
- Added lints, specs and coverage tests.

#### v0.2.1
- Honeyloops is now a proper NPM package.

[Full changelog](CHANGELOG.md)


License
-------
The MIT License (MIT)

Copyright (c) 2013-2014, zenoamaro <zenoamaro@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.