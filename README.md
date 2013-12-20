Honeyloops
==========


Honeyloops is a micro library (596 bytes minified) to batch execution of handlers during a [frame rendering](https://developer.mozilla.org/en/docs/Web/API/window.requestAnimationFrame) or a reduced interval on older, slower browsers.

Include `honeyloops.js` or `honeyloops.min.js` in your page, and register your handlers:

```javascript
Honeyloops.register(function(){
    if (this.hasChanged())
        this.update();
}, this);
```

Then start the request loop:

```javascript
Honeyloops.start()
```

Honeyloops are best served with selective data binding.