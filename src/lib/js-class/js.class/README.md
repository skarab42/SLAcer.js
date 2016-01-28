js.class [![Build Status](https://travis-ci.org/dkraczkowski/js.class.svg?branch=master)](https://travis-ci.org/dkraczkowski/js.class)
========

js.class is a class library which focuses on simplifying OOP in javascript by providing rich set of tools like: mixins, inheritance, getters, setters and more.

Version `2.6.0` contains [sjs](http://sweetjs.org/) macros for ES6 syntax.

###Features:
 - super fast!
 - small footprint, no dependency, 0.2K minimized
 - works on both browser (with UMD wrapper) and node.js
 - supports: inheritance, statics, constans, mixins, getters, setters
 - typeOf
 - build in singleton support
 - ES6 syntax via sjs

Installation
============

###Npm
```
npm install js.class
```

###Bower
```
bower install js.class
```

API
=========================

###Usage
####Node.js
```
var JSClass = require('js.class');
var MyClass = JSClass({
    myMethod: function() {} //your method declaration
});
```
####Browser
#####Normal version
```html
<script type="text/javascript" src="dist/js.class.min.js"></script>
<script>
var MyClass = JSClass({
    myMethod: function() {} //your method declaration
});
</script>
```
#####AMD version:
```js
define(['JSClass'], function (JSClass) {
    var MyClass = JSClass({
        myMethod: function() {} //your method declaration
    });
});
```

###JSClass ES6 syntax
`JSClass` supports ES6 syntax thanks to sweet.js. In order to use ES6 syntax make sure you have installed [sweet.js node loader](https://github.com/mozilla/sweet.js/wiki/node-loader) and library is required as JSClass.


###Class declaration

```js
var MyClass = JSClass({
    myMethod: function() {} //your method declaration
});
```

####ES6 syntax
```js
class MyClass {}
```

###Constructor pattern

```js
var MyClass = JSClass({
    create: function(param1, param2) {//this will be called with new keyword
        this.param1 = param1;
        this.param2 = param2;
    }
});

var instance = new MyClass(1,2);
console.log(instance.param1);//1
console.log(instance.param2);//2
```

####ES6 syntax
```js
class MyClass {
  create(param1, param2) {
    this.param1 = param1;
    this.param2 = param2;
  }
}
```

###Getters/Setters

> Getters/Setters will not work in ie < 8 due to lack of Object.defineProperty support

```js
var MyClass = JSClass({
    create: function(param1, param2) {//this will be called with new keyword
        this.param1 = param1;
        this.param2 = param2;
    },
    get: {
        allParams = function() {
            return [param1, param2];
        },
        evenParams = function() {
            return [param1];
        },
        oddParams = function() {
            return [param2];
        }
    },
    set: {
        allParams: function(value) {
            this.param1 = value[0];
            this.param2 = value[1];
        }
    }
});
var instance = new MyClass(1,2);
console.log(instance.allParams);//[1,2]
console.log(instance.oddParams);//[2]

instance.allParams = [3,4];
console.log(instance.allParams);//[3,4]
```

_Check tests for more examples_

###Inheritance
```js
var MyChildClass = MyClass.extend({});
```

####ES6 syntax
```js
class MyChildClass extends MyClass {}
```

###Invoking overridden methods
```js
var MyClass = JSClass({
    myMethod: function() {};
});
var MyChildClass = MyClass.extend({
    myMethod: function() {
        MyClass.prototype.myMethod.apply(this, arguments);
    }
});
```

####ES6 syntax
```js
class MyClass {
    myMethod() {
    }
}
class MyChildClass extends MyClass {
    myMethod() {
        super();//this will call MyClass#myMethod
    }
}
```

###Statics and constans

> Constans will not work in ie >=8 due to lack of Object.defineProperty support


Static variables can be easy defined by usage of `static` function, which accepts literal object.

```js
var StaticExample = JSClass({
}).static({
    myStatic: 'myStatic'
});
console.log(StaticExample.myStatic);//myStatic
StaticExample.myStatic = 'otherValue';
console.log(StaticExample.myStatic);//otherValue
```

If literal object will contain a key in uppercase js-class will treat a variable as a constans:
```js
var ConstantExample = JSClass({
}).static({
    MY_CONST: 'const'
});
console.log(ConstantExample.MY_CONST);//const
ConstantExample.MY_CONST = 'otherValue';
console.log(ConstantExample.MY_CONST);//const
```

###Mixins

Mixin is a class which contains a combination of methods from other classes
Its really usefull strategy if you are going to follow DRY methodology.
To define mixin we need to simply use `mixin` method:
```js
var Pet = JSClass({
    name: function(name) {
        if (typeof name === 'undefined') {
            return this.name;
        }
        this.name = name;
    }
});
var Animal = Class({
    eat: function() {
        this.fed = true;
    },
    drink: function() {
        this.thirsty = false;
    }
});
var Dog = JSClass({
}).mixin(Pet, Animal);
var pluto = new Dog();
pluto.eat();
pluto.name('pluto');

console.log(pluto.name());//pluto
console.log(pluto.thirsty);//false
```

####ES6 syntax
```js
class Pet {
  name(name) {
    if (typeof name === 'undefined') {
        return this.name;
    }
    this.name = name;
  }
}
class Animal {
  eat() {
    this.fed = true;
  }
  drink() {
    this.thirsty = false;
  }
}
class Dog implements Pet, Animal {}

var pluto = new Dog();
pluto.eat();
pluto.name('pluto');

console.log(pluto.name());//pluto
console.log(pluto.thirsty);//false
```

###Singleton
In order to create singleton class set `singleton` property to true, eg.:
```js
var Singleton = JSClass({
    singleton: true,
    doA: function() {
        return 'a';
    }
});

var p1 = Singleton.instance();
var p2 = Singleton.instance();

p1 === p2;//true

new Singleton();//will throw an Error
```

###typeOf

js.class provides handy `typeOf` method in every instance of class,
the method allows you to determine whather object is a mixin of given class:

```js
var pluto = new Dog();

console.log(pluto.typeOf(Dog));//true
console.log(pluto.typeOf(Animal));//true
console.log(pluto.typeOf(Pet));//true
console.log(pluto.typeOf(MyClass));//false
```

####ES6 syntax
```
var pluto = new Dog();

console.log(pluto is Dog);//true
console.log(pluto is Animal);//true
console.log(pluto is Pet);//true
console.log(pluto is MyClass);//false
```

Instance of support
===================
js.class does support `instanceof` operator. Consider the following example:

```js
var MyClass = JSClass({
    create: function(param1, param2) {
        this.param1 = param1;
        this.param2 = param2;
    }
});
var MyChildClass = MyClass.extend({});

var t = new MyChildClass();

console.log(t instanceof MyClass);//true
console.log(t instanceof MyChildClass);//true
```

####ES6 syntax
```
class MyClass {
  create(param1, param2) {
    this.param1 = param1;
    this.param2 = param2;
  }
}
class MyChildClass extends MyClass {

}

var t = new MyChildClass();

console.log(t instanceof MyClass);//true
console.log(t instanceof MyChildClass);//true

```

For Developers
==============
###Running tests
```
npm install
npm test
```
###Running benchmarks
```
node ./benchmark/class-declaration.js
node ./benchmark/class-extend.js
node ./benchmark/class-mixins.js
```

####Class declaration benchs
```
node ./benchmark/class-declaration.js

class x 75,624 ops/sec ±3.23% (86 runs sampled)
js.class x 50,721 ops/sec ±9.67% (63 runs sampled)
klass x 44,743 ops/sec ±8.60% (74 runs sampled)
ee-class x 25,366 ops/sec ±6.20% (77 runs sampled)
```

####Class extension benchs
```
node ./benchmark/class-extend.js

js.class x 126,312 ops/sec ±3.57% (92 runs sampled)
class x 78,576 ops/sec ±5.05% (85 runs sampled)
klass x 59,602 ops/sec ±7.94% (76 runs sampled)
ee-class x 37,730 ops/sec ±4.70% (85 runs sampled)
```

####Mixins benchs
```
node ./benchmark/class-mixins.js

js.class x 677,574 ops/sec ±5.74% (86 runs sampled)
class x 541,828 ops/sec ±2.33% (93 runs sampled)
klass x 210,674 ops/sec ±6.61% (83 runs sampled)
ee-class x 140,770 ops/sec ±1.89% (96 runs sampled)
```
| Note that only js.class supports `typeof` method, which allows you to determine whether given object is a mixin of other object/class.

####Conclusion
You may notice simple class declaration is the fastest in `class` library, but when it comes to more
advanced oop features `js.class` is a good choice.

Version History
===============
### 2.6.1
Fixed bug with multiple statics
### 2.6.0
Added base javascript macros
### 2.5.3
Added [UMD](https://github.com/umdjs/umd) wrapper, organize the build folder and added `npm run build` to create both the build and the minified version.
### 2.5.2
Fix issue with set and get with multiple instances of the same Class (Thanks to fastrde)
### 2.5.1
Fixed constructor in factored objects
### 2.5.0
Added setters/getters support
### 2.4.1
Singleton object cannot be extended
### 2.4.0
Added singleton support
### 2.2.6
Mixin method accepts objects as well
### 2.2.5
Added benchmarks for libraries `class`, `klass`, `ee-class`
### 2.2.1
Fixed instance's statics. Now if you change instance's static it will be changed across all other instances of the same class
### 2.2.0
Removed behaviour which was copying consts/statics into children class
