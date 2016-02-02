threex.keyboardstate
====================

threex.keyboardstate is a [threex game extension for three.js](http://jeromeetienne.github.io/threex/) which makes it easy to keep the current state of the keyboard. It is possible to query it at any time. No need of an event. This is particularly convenient in loop driven case, like in 3D demos or games. The syntax of the keys has been copied from [jquery keyboard plugin](https://github.com/jeresig/jquery.hotkeys) to ease configuration. It can help you control the characters of your three.js games. 

Show Don't Tell
===============
* [examples/basic.html](http://jeromeetienne.github.io/threex.keyboardstate/examples/basic.html)
\[[view source](https://github.com/jeromeetienne/threex.keyboardstate/blob/master/examples/basic.html)\] :
It shows a basic usage of keyboard state.
* [examples/norepeatkeydown.html](http://jeromeetienne.github.io/threex.keyboardstate/examples/norepeatkeydown.html)
\[[view source](https://github.com/jeromeetienne/threex.keyboardstate/blob/master/examples/norepeatkeydown.html)\] :
It show how to avoid the key repeat if you need it.
* [examples/standalone.html](http://jeromeetienne.github.io/threex.keyboardstate/examples/standalone.html)
\[[view source](https://github.com/jeromeetienne/threex.keyboardstate/blob/master/examples/standalone.html)\] :
It show a standalone usage, without three.js anywhere.


A Screenshot
============
[![screenshot](https://raw.githubusercontent.com/jeromeetienne/threex.keyboardstate/master/examples/images/screenshot-threex-keyboardstate-512x512.jpg)](http://jeromeetienne.github.io/threex.keyboardstate/examples/basic.html)


How To Install It
=================
You can install it manually. Just do 

```html
<script src='threex.keyboardstate.js'></script>
```

You can install with [bower](http://bower.io/).

```bash
bower install threex.keyboardstate
```

## How To Use It ? 

**Step 1**: Create the object

```javascript
var keyboard	= new THREEx.KeyboardState();
```

**Step 2**: Query the keyboard state

This will return true if shift and A are pressed, false otherwise

```javascript
keyboard.pressed("shift+A")
```

**Step 3**: Stop listening to the keyboard

```javascript
keyboard.destroy()
```

NOTE: this library may be nice as standaline. independant from three.js
