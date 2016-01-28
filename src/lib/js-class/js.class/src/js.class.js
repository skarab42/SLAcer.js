/**
 * @license
 * Copyright (C) 2011 by crac <![[dawid.kraczkowski[at]gmail[dot]com]]>
 * Thanks for Hardy Keppler<![[Keppler.H[at]online.de]]> for shortened version
 * Thanks for Leonardo Apiwan<![[https://github.com/homer0]]> for UMD wrapper
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 **/
 (function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.JSClass = factory();
   }
}(this, function () {

    var JSClass = (function() {

        function _rewriteStatics(fnc, statics) {
            for (var prop in statics) {
                if (prop === 'extend' || prop === 'static' || prop === 'typeOf' || prop === 'mixin' ) {
                    continue;
                }

                if (typeof statics[prop] === 'object' || typeof statics[prop] === 'function') {
                    fnc[prop] = statics[prop];
                    return;
                }

                //check if static is a constant
                if (prop === prop.toUpperCase()) {
                    Object.defineProperty(fnc, prop, {
                        writable: false,
                        configurable: false,
                        enumerable: true,
                        value: statics[prop]
                    });
                    Object.defineProperty(fnc.prototype, prop, {
                        writable: false,
                        configurable: false,
                        enumerable: true,
                        value: statics[prop]
                    });
                } else {
                    (function(property) {
                        Object.defineProperty(fnc, property, {
                            get: function() {
                                return statics[property]
                            },
                            set: function(val) {
                                statics[property] = val;
                            }
                        });
                        Object.defineProperty(fnc.prototype, property, {
                            get: function() {
                                return statics[property]
                            },
                            set: function(val) {
                                statics[property] = val;
                            }
                        });
                    })(prop);
                }
            }
        }

        function _extend(base, source, overrideConstructor) {
            overrideConstructor = overrideConstructor || false;

            for (var p in source) {
                if ((p === 'create' && !overrideConstructor) || p === 'typeOf' || p === 'mixin' || p === 'static' || p === 'extend') {
                    continue;
                }
                base[p] = source[p];
            }
        }

        return function (classBody) {

            var _preventCreateCall = false;

            return (function createClass(self, classBody) {

                var _mixins = [];
                var instance;

                var isSingleton = classBody.hasOwnProperty('singleton') && classBody.singleton;

                var classConstructor = function () {
                    //apply constructor pattern
                    if (typeof this['create'] === 'function' && _preventCreateCall === false) {
                        this.create.apply(this, arguments);
                    }

                    //apply getter pattern
                    if (classBody.hasOwnProperty('get')) {
                        for (var p in classBody.get) {

                            var setter = 'set' in classBody ? (p in classBody.set ? classBody.set[p] : null) : null;
                            if (setter === null) {
                                Object.defineProperty(this, p, {
                                    get: classBody.get[p]
                                });
                            }
                        }
                    }

                    //apply setter pattern
                    if (classBody.hasOwnProperty('set')) {
                        for (var p in classBody.set) {

                            var getter = 'get' in classBody ? (p in classBody.get ? classBody.get[p] : null) : null;
                            if (getter !== null) {
                                Object.defineProperty(this, p, {
                                    set: classBody.set[p],
                                    get: classBody.get[p]
                                });
                            } else {
                                Object.defineProperty(this, p, {
                                    set: classBody.set[p]
                                });
                            }
                        }
                    }

                    if (isSingleton && typeof this !== 'undefined') {
                        throw new Error('Singleton object cannot have more than one instance, call instance method instead');
                    }
                    this.constructor = classConstructor;
                };

                //make new class instance of extended object
                if (self !== null) {
                    _preventCreateCall = true;
                    classConstructor.prototype = new self();
                    _preventCreateCall = false;
                }

                var classPrototype = classConstructor.prototype;

                classPrototype.typeOf = function(cls) {
                    if (typeof cls === 'object') {
                        return _mixins.indexOf(cls) >= 0;
                    } else if (typeof cls === 'function') {
                        if (this instanceof cls) {
                            return true;
                        } else if (_mixins.indexOf(cls) >= 0) {
                            return true;
                        }
                    }

                    return false;
                };
                if (typeof classBody === 'function') {
                    classBody = classBody();
                }

                _extend(classPrototype, classBody, true);

                /**
                 * Defines statics and constans in class' body.
                 *
                 * @param {Object} statics
                 * @returns {Function}
                 */
                classConstructor.static = function(statics) {
                    _rewriteStatics(classConstructor, statics);
                    return classConstructor;
                };

                /**
                 * Extends class body by passed other class declaration
                 * @param {Function} *mixins
                 * @returns {Function}
                 */
                classConstructor.mixin = function() {
                    for (var i = 0, l = arguments.length; i < l; i++) {
                        //check if class implements interfaces
                        var mixin = arguments[i];

                        if (typeof mixin === 'function') {
                            var methods = mixin.prototype;
                        } else if (typeof mixin === 'object') {
                            var methods = mixin;
                        } else {
                            throw new Error('js.class mixin method accepts only types: object, function - `' + (typeof mixin) + '` type given');
                        }
                        _extend(classPrototype, methods, false);
                        _mixins.push(mixin);
                    }
                    return classConstructor;
                };

                /**
                 * Creates and returns new constructor function which extends
                 * its parent
                 *
                 * @param {Object} classBody
                 * @returns {Function}
                 */
                if (isSingleton) {
                    classConstructor.extend = function() {
                        throw new Error('Singleton class cannot be extended');
                    };

                    classConstructor.instance = function() {
                        if (!instance) {
                            isSingleton = false;
                            instance = new classConstructor();
                            isSingleton = true;
                        }
                        return instance;
                    }

                } else {
                    classConstructor.extend = function (classBody) {
                        return createClass(this, classBody);
                    };
                }

                return classConstructor;
            })(null, classBody);
        }
    })();
    return JSClass;
}));
