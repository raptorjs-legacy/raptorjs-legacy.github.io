// vim: ts=4 sts=4 sw=4 expandtab
// -- kriskowal Kris Kowal Copyright (C) 2009-2011 MIT License
// -- tlrobinson Tom Robinson Copyright (C) 2009-2010 MIT License (Narwhal Project)
// -- dantman Daniel Friesen Copyright (C) 2010 XXX TODO License or CLA
// -- fschaefer Florian Sch�fer Copyright (C) 2010 MIT License
// -- Gozala Irakli Gozalishvili Copyright (C) 2010 MIT License
// -- kitcambridge Kit Cambridge Copyright (C) 2011 MIT License
// -- kossnocorp Sasha Koss XXX TODO License or CLA
// -- bryanforbes Bryan Forbes XXX TODO License or CLA
// -- killdream Quildreen Motta Copyright (C) 2011 MIT Licence
// -- michaelficarra Michael Ficarra Copyright (C) 2011 3-clause BSD License
// -- sharkbrainguy Gerard Paapu Copyright (C) 2011 MIT License
// -- bbqsrc Brendan Molloy (C) 2011 Creative Commons Zero (public domain)
// -- iwyg XXX TODO License or CLA
// -- DomenicDenicola Domenic Denicola Copyright (C) 2011 MIT License
// -- xavierm02 Montillet Xavier Copyright (C) 2011 MIT License
// -- Raynos Jake Verbaten Copyright (C) 2011 MIT Licence
// -- samsonjs Sami Samhuri Copyright (C) 2010 MIT License
// -- rwldrn Rick Waldron Copyright (C) 2011 MIT License
// -- lexer Alexey Zakharov XXX TODO License or CLA

/*!
    Copyright (c) 2009, 280 North Inc. http://280north.com/
    MIT License. http://github.com/280north/narwhal/blob/master/README.md
*/

// Module systems magic dance
//(function (definition) {
//    // RequireJS
//    if (typeof define == "function") {
//        define(definition);
//    // YUI3
//    } else if (typeof YUI == "function") {
//        YUI.add("es5", definition);
//    // CommonJS and <script>
//    } else {
//        definition();
//    }
//})

(function () {

/*jshint evil: true, strict: false, regexp: false */

/**
 * Brings an environment as close to ECMAScript 5 compliance
 * as is possible with the facilities of erstwhile engines.
 *
 * Annotated ES5: http://es5.github.com/ (specific links below)
 * ES5 Spec: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
 * Required reading: http://javascriptweblog.wordpress.com/2011/12/05/extending-javascript-natives/
 */

//
// Util
// ======
//

// ES5 9.4
// http://es5.github.com/#x9.4
// http://jsperf.com/to-integer
var toInteger = function (n) {
    n = +n;
    if (n !== n) { // isNaN
        n = 0;
    } else if (n !== 0 && n !== (1/0) && n !== -(1/0)) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
    }
    return n;
};

var prepareString = "a"[0] != "a";
    // ES5 9.9
    // http://es5.github.com/#x9.9
var toObject = function (o) {
    if (o == null) { // this matches both null and undefined
        throw new TypeError("can't convert "+o+" to object");
    }
    // If the implementation doesn't support by-index access of
    // string characters (ex. IE < 9), split the string
    if (prepareString && typeof o == "string" && o) {
        return o.split("");
    }
    return Object(o);
};

var call = Function.prototype.call;
var prototypeOfArray = Array.prototype;
var prototypeOfObject = Object.prototype;
var slice = prototypeOfArray.slice;

//
// Function
// ========
//

// ES-5 15.3.4.5
// http://es5.github.com/#x15.3.4.5

if (!Function.prototype.bind) {
    Function.prototype.bind = function bind(that) { // .length is 1
        // 1. Let Target be the this value.
        var target = this;
        // 2. If IsCallable(Target) is false, throw a TypeError exception.
        if (typeof target != "function") {
            throw new TypeError("Function.prototype.bind called on incompatible " + target);
        }
        // 3. Let A be a new (possibly empty) internal list of all of the
        //   argument values provided after thisArg (arg1, arg2 etc), in order.
        // XXX slicedArgs will stand in for "A" if used
        var args = slice.call(arguments, 1); // for normal call
        // 4. Let F be a new native ECMAScript object.
        // 11. Set the [[Prototype]] internal property of F to the standard
        //   built-in Function prototype object as specified in 15.3.3.1.
        // 12. Set the [[Call]] internal property of F as described in
        //   15.3.4.5.1.
        // 13. Set the [[Construct]] internal property of F as described in
        //   15.3.4.5.2.
        // 14. Set the [[HasInstance]] internal property of F as described in
        //   15.3.4.5.3.
        var bound = function () {

            if (this instanceof bound) {
                // 15.3.4.5.2 [[Construct]]
                // When the [[Construct]] internal method of a function object,
                // F that was created using the bind function is called with a
                // list of arguments ExtraArgs, the following steps are taken:
                // 1. Let target be the value of F's [[TargetFunction]]
                //   internal property.
                // 2. If target has no [[Construct]] internal method, a
                //   TypeError exception is thrown.
                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Construct]] internal
                //   method of target providing args as the arguments.

                var F = function(){};
                F.prototype = target.prototype;
                var self = new F;

                var result = target.apply(
                    self,
                    args.concat(slice.call(arguments))
                );
                if (Object(result) === result) {
                    return result;
                }
                return self;

            } else {
                // 15.3.4.5.1 [[Call]]
                // When the [[Call]] internal method of a function object, F,
                // which was created using the bind function is called with a
                // this value and a list of arguments ExtraArgs, the following
                // steps are taken:
                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 2. Let boundThis be the value of F's [[BoundThis]] internal
                //   property.
                // 3. Let target be the value of F's [[TargetFunction]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Call]] internal method
                //   of target providing boundThis as the this value and
                //   providing args as the arguments.

                // equiv: target.call(this, ...boundArgs, ...args)
                return target.apply(
                    that,
                    args.concat(slice.call(arguments))
                );

            }

        };
        // XXX bound.length is never writable, so don't even try
        //
        // 15. If the [[Class]] internal property of Target is "Function", then
        //     a. Let L be the length property of Target minus the length of A.
        //     b. Set the length own property of F to either 0 or L, whichever is
        //       larger.
        // 16. Else set the length own property of F to 0.
        // 17. Set the attributes of the length own property of F to the values
        //   specified in 15.3.5.1.

        // TODO
        // 18. Set the [[Extensible]] internal property of F to true.

        // TODO
        // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
        // 20. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
        //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
        //   false.
        // 21. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
        //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
        //   and false.

        // TODO
        // NOTE Function objects created using Function.prototype.bind do not
        // have a prototype property or the [[Code]], [[FormalParameters]], and
        // [[Scope]] internal properties.
        // XXX can't delete prototype in pure-js.

        // 22. Return F.
        return bound;
    };
}

// Shortcut to an often accessed properties, in order to avoid multiple
// dereference that costs universally.
// _Please note: Shortcuts are defined after `Function.prototype.bind` as we
// us it in defining shortcuts.

// Having a toString local variable name breaks in Opera so use _toString.
var _toString = call.bind(prototypeOfObject.toString);
var owns = call.bind(prototypeOfObject.hasOwnProperty);

//// If JS engine supports accessors creating shortcuts.
//var defineGetter;
//var defineSetter;
//var lookupGetter;
//var lookupSetter;
//var supportsAccessors;
//if ((supportsAccessors = owns(prototypeOfObject, "__defineGetter__"))) {
//    defineGetter = call.bind(prototypeOfObject.__defineGetter__);
//    defineSetter = call.bind(prototypeOfObject.__defineSetter__);
//    lookupGetter = call.bind(prototypeOfObject.__lookupGetter__);
//    lookupSetter = call.bind(prototypeOfObject.__lookupSetter__);
//}

//
// Array
// =====
//

// ES5 15.4.3.2
// http://es5.github.com/#x15.4.3.2
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
if (!Array.isArray) {
    Array.isArray = function isArray(obj) {
        return _toString(obj) == "[object Array]";
    };
}

// The IsCallable() check in the Array functions
// has been replaced with a strict check on the
// internal class of the object to trap cases where
// the provided function was actually a regular
// expression literal, which in V8 and
// JavaScriptCore is a typeof "function".  Only in
// V8 are regular expression literals permitted as
// reduce parameters, so it is desirable in the
// general case for the shim to match the more
// strict and common behavior of rejecting regular
// expressions.

// ES5 15.4.4.18
// http://es5.github.com/#x15.4.4.18
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function forEach(fun /*, thisp*/) {
        var self = toObject(this),
            thisp = arguments[1],
            i = -1,
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(); // TODO message
        }

        while (++i < length) {
            if (i in self) {
                // Invoke the callback function with call, passing arguments:
                // context, property value, property key, thisArg object context
                fun.call(thisp, self[i], i, self);
            }
        }
    };
}

// ES5 15.4.4.19
// http://es5.github.com/#x15.4.4.19
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
if (!Array.prototype.map) {
    Array.prototype.map = function map(fun /*, thisp*/) {
        var self = toObject(this),
            length = self.length >>> 0,
            result = Array(length),
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self)
                result[i] = fun.call(thisp, self[i], i, self);
        }
        return result;
    };
}

// ES5 15.4.4.20
// http://es5.github.com/#x15.4.4.20
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
if (!Array.prototype.filter) {
    Array.prototype.filter = function filter(fun /*, thisp */) {
        var self = toObject(this),
            length = self.length >>> 0,
            result = [],
            value,
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self) {
                value = self[i];
                if (fun.call(thisp, value, i, self)) {
                    result.push(value);
                }
            }
        }
        return result;
    };
}

// ES5 15.4.4.16
// http://es5.github.com/#x15.4.4.16
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
if (!Array.prototype.every) {
    Array.prototype.every = function every(fun /*, thisp */) {
        var self = toObject(this),
            length = self.length >>> 0,
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self && !fun.call(thisp, self[i], i, self)) {
                return false;
            }
        }
        return true;
    };
}

// ES5 15.4.4.17
// http://es5.github.com/#x15.4.4.17
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
if (!Array.prototype.some) {
    Array.prototype.some = function some(fun /*, thisp */) {
        var self = toObject(this),
            length = self.length >>> 0,
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self && fun.call(thisp, self[i], i, self)) {
                return true;
            }
        }
        return false;
    };
}

// ES5 15.4.4.21
// http://es5.github.com/#x15.4.4.21
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function reduce(fun /*, initial*/) {
        var self = toObject(this),
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        // no value to return if no initial value and an empty array
        if (!length && arguments.length == 1) {
            throw new TypeError('reduce of empty array with no initial value');
        }

        var i = 0;
        var result;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i++];
                    break;
                }

                // if array contains no values, no initial value to return
                if (++i >= length) {
                    throw new TypeError('reduce of empty array with no initial value');
                }
            } while (true);
        }

        for (; i < length; i++) {
            if (i in self) {
                result = fun.call(void 0, result, self[i], i, self);
            }
        }

        return result;
    };
}

// ES5 15.4.4.22
// http://es5.github.com/#x15.4.4.22
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
if (!Array.prototype.reduceRight) {
    Array.prototype.reduceRight = function reduceRight(fun /*, initial*/) {
        var self = toObject(this),
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        // no value to return if no initial value, empty array
        if (!length && arguments.length == 1) {
            throw new TypeError('reduceRight of empty array with no initial value');
        }

        var result, i = length - 1;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i--];
                    break;
                }

                // if array contains no values, no initial value to return
                if (--i < 0) {
                    throw new TypeError('reduceRight of empty array with no initial value');
                }
            } while (true);
        }

        do {
            if (i in this) {
                result = fun.call(void 0, result, self[i], i, self);
            }
        } while (i--);

        return result;
    };
}

// ES5 15.4.4.14
// http://es5.github.com/#x15.4.4.14
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function indexOf(sought /*, fromIndex */ ) {
        var self = toObject(this),
            length = self.length >>> 0;

        if (!length) {
            return -1;
        }

        var i = 0;
        if (arguments.length > 1) {
            i = toInteger(arguments[1]);
        }

        // handle negative indices
        i = i >= 0 ? i : Math.max(0, length + i);
        for (; i < length; i++) {
            if (i in self && self[i] === sought) {
                return i;
            }
        }
        return -1;
    };
}

// ES5 15.4.4.15
// http://es5.github.com/#x15.4.4.15
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
if (!Array.prototype.lastIndexOf) {
    Array.prototype.lastIndexOf = function lastIndexOf(sought /*, fromIndex */) {
        var self = toObject(this),
            length = self.length >>> 0;

        if (!length) {
            return -1;
        }
        var i = length - 1;
        if (arguments.length > 1) {
            i = Math.min(i, toInteger(arguments[1]));
        }
        // handle negative indices
        i = i >= 0 ? i : length - Math.abs(i);
        for (; i >= 0; i--) {
            if (i in self && sought === self[i]) {
                return i;
            }
        }
        return -1;
    };
}

//
// Object
// ======
//

//// ES5 15.2.3.2
//// http://es5.github.com/#x15.2.3.2
//if (!Object.getPrototypeOf) {
//    // https://github.com/kriskowal/es5-shim/issues#issue/2
//    // http://ejohn.org/blog/objectgetprototypeof/
//    // recommended by fschaefer on github
//    Object.getPrototypeOf = function getPrototypeOf(object) {
//        return object.__proto__ || (
//            object.constructor
//                ? object.constructor.prototype
//                : prototypeOfObject
//        );
//    };
//}
//
//// ES5 15.2.3.3
//// http://es5.github.com/#x15.2.3.3
//if (!Object.getOwnPropertyDescriptor) {
//    var ERR_NON_OBJECT = "Object.getOwnPropertyDescriptor called on a non-object: ";
//
//    Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {
//        if ((typeof object != "object" && typeof object != "function") || object === null) {
//            throw new TypeError(ERR_NON_OBJECT + object);
//        }
//        // If object does not owns property return undefined immediately.
//        if (!owns(object, property)) {
//            return;
//        }
//
//        // If object has a property then it's for sure both `enumerable` and
//        // `configurable`.
//        var descriptor =  { enumerable: true, configurable: true };
//
//        // If JS engine supports accessor properties then property may be a
//        // getter or setter.
//        if (supportsAccessors) {
//            // Unfortunately `__lookupGetter__` will return a getter even
//            // if object has own non getter property along with a same named
//            // inherited getter. To avoid misbehavior we temporary remove
//            // `__proto__` so that `__lookupGetter__` will return getter only
//            // if it's owned by an object.
//            var prototype = object.__proto__;
//            object.__proto__ = prototypeOfObject;
//
//            var getter = lookupGetter(object, property);
//            var setter = lookupSetter(object, property);
//
//            // Once we have getter and setter we can put values back.
//            object.__proto__ = prototype;
//
//            if (getter || setter) {
//                if (getter) {
//                    descriptor.get = getter;
//                }
//                if (setter) {
//                    descriptor.set = setter;
//                }
//                // If it was accessor property we're done and return here
//                // in order to avoid adding `value` to the descriptor.
//                return descriptor;
//            }
//        }
//
//        // If we got this far we know that object has an own property that is
//        // not an accessor so we set it as a value and return descriptor.
//        descriptor.value = object[property];
//        return descriptor;
//    };
//}
//
//// ES5 15.2.3.4
//// http://es5.github.com/#x15.2.3.4
//if (!Object.getOwnPropertyNames) {
//    Object.getOwnPropertyNames = function getOwnPropertyNames(object) {
//        return Object.keys(object);
//    };
//}
//
//// ES5 15.2.3.5
//// http://es5.github.com/#x15.2.3.5
//if (!Object.create) {
//    Object.create = function create(prototype, properties) {
//        var object;
//        if (prototype === null) {
//            object = { "__proto__": null };
//        } else {
//            if (typeof prototype != "object") {
//                throw new TypeError("typeof prototype["+(typeof prototype)+"] != 'object'");
//            }
//            var Type = function () {};
//            Type.prototype = prototype;
//            object = new Type();
//            // IE has no built-in implementation of `Object.getPrototypeOf`
//            // neither `__proto__`, but this manually setting `__proto__` will
//            // guarantee that `Object.getPrototypeOf` will work as expected with
//            // objects created using `Object.create`
//            object.__proto__ = prototype;
//        }
//        if (properties !== void 0) {
//            Object.defineProperties(object, properties);
//        }
//        return object;
//    };
//}
//
//// ES5 15.2.3.6
//// http://es5.github.com/#x15.2.3.6
//
//// Patch for WebKit and IE8 standard mode
//// Designed by hax <hax.github.com>
//// related issue: https://github.com/kriskowal/es5-shim/issues#issue/5
//// IE8 Reference:
////     http://msdn.microsoft.com/en-us/library/dd282900.aspx
////     http://msdn.microsoft.com/en-us/library/dd229916.aspx
//// WebKit Bugs:
////     https://bugs.webkit.org/show_bug.cgi?id=36423
//
//function doesDefinePropertyWork(object) {
//    try {
//        Object.defineProperty(object, "sentinel", {});
//        return "sentinel" in object;
//    } catch (exception) {
//        // returns falsy
//    }
//}
//
//// check whether defineProperty works if it's given. Otherwise,
//// shim partially.
//if (Object.defineProperty) {
//    var definePropertyWorksOnObject = doesDefinePropertyWork({});
//    var definePropertyWorksOnDom = typeof document == "undefined" ||
//        doesDefinePropertyWork(document.createElement("div"));
//    if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {
//        var definePropertyFallback = Object.defineProperty;
//    }
//}
//
//if (!Object.defineProperty || definePropertyFallback) {
//    var ERR_NON_OBJECT_DESCRIPTOR = "Property description must be an object: ";
//    var ERR_NON_OBJECT_TARGET = "Object.defineProperty called on non-object: "
//    var ERR_ACCESSORS_NOT_SUPPORTED = "getters & setters can not be defined " +
//                                      "on this javascript engine";
//
//    Object.defineProperty = function defineProperty(object, property, descriptor) {
//        if ((typeof object != "object" && typeof object != "function") || object === null) {
//            throw new TypeError(ERR_NON_OBJECT_TARGET + object);
//        }
//        if ((typeof descriptor != "object" && typeof descriptor != "function") || descriptor === null) {
//            throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);
//        }
//        // make a valiant attempt to use the real defineProperty
//        // for I8's DOM elements.
//        if (definePropertyFallback) {
//            try {
//                return definePropertyFallback.call(Object, object, property, descriptor);
//            } catch (exception) {
//                // try the shim if the real one doesn't work
//            }
//        }
//
//        // If it's a data property.
//        if (owns(descriptor, "value")) {
//            // fail silently if "writable", "enumerable", or "configurable"
//            // are requested but not supported
//            /*
//            // alternate approach:
//            if ( // can't implement these features; allow false but not true
//                !(owns(descriptor, "writable") ? descriptor.writable : true) ||
//                !(owns(descriptor, "enumerable") ? descriptor.enumerable : true) ||
//                !(owns(descriptor, "configurable") ? descriptor.configurable : true)
//            )
//                throw new RangeError(
//                    "This implementation of Object.defineProperty does not " +
//                    "support configurable, enumerable, or writable."
//                );
//            */
//
//            if (supportsAccessors && (lookupGetter(object, property) ||
//                                      lookupSetter(object, property)))
//            {
//                // As accessors are supported only on engines implementing
//                // `__proto__` we can safely override `__proto__` while defining
//                // a property to make sure that we don't hit an inherited
//                // accessor.
//                var prototype = object.__proto__;
//                object.__proto__ = prototypeOfObject;
//                // Deleting a property anyway since getter / setter may be
//                // defined on object itself.
//                delete object[property];
//                object[property] = descriptor.value;
//                // Setting original `__proto__` back now.
//                object.__proto__ = prototype;
//            } else {
//                object[property] = descriptor.value;
//            }
//        } else {
//            if (!supportsAccessors) {
//                throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
//            }
//            // If we got that far then getters and setters can be defined !!
//            if (owns(descriptor, "get")) {
//                defineGetter(object, property, descriptor.get);
//            }
//            if (owns(descriptor, "set")) {
//                defineSetter(object, property, descriptor.set);
//            }
//        }
//        return object;
//    };
//}
//
//// ES5 15.2.3.7
//// http://es5.github.com/#x15.2.3.7
//if (!Object.defineProperties) {
//    Object.defineProperties = function defineProperties(object, properties) {
//        for (var property in properties) {
//            if (owns(properties, property) && property != "__proto__") {
//                Object.defineProperty(object, property, properties[property]);
//            }
//        }
//        return object;
//    };
//}
//
//// ES5 15.2.3.8
//// http://es5.github.com/#x15.2.3.8
//if (!Object.seal) {
//    Object.seal = function seal(object) {
//        // this is misleading and breaks feature-detection, but
//        // allows "securable" code to "gracefully" degrade to working
//        // but insecure code.
//        return object;
//    };
//}
//
//// ES5 15.2.3.9
//// http://es5.github.com/#x15.2.3.9
//if (!Object.freeze) {
//    Object.freeze = function freeze(object) {
//        // this is misleading and breaks feature-detection, but
//        // allows "securable" code to "gracefully" degrade to working
//        // but insecure code.
//        return object;
//    };
//}
//
//// detect a Rhino bug and patch it
//try {
//    Object.freeze(function () {});
//} catch (exception) {
//    Object.freeze = (function freeze(freezeObject) {
//        return function freeze(object) {
//            if (typeof object == "function") {
//                return object;
//            } else {
//                return freezeObject(object);
//            }
//        };
//    })(Object.freeze);
//}
//
//// ES5 15.2.3.10
//// http://es5.github.com/#x15.2.3.10
//if (!Object.preventExtensions) {
//    Object.preventExtensions = function preventExtensions(object) {
//        // this is misleading and breaks feature-detection, but
//        // allows "securable" code to "gracefully" degrade to working
//        // but insecure code.
//        return object;
//    };
//}
//
//// ES5 15.2.3.11
//// http://es5.github.com/#x15.2.3.11
//if (!Object.isSealed) {
//    Object.isSealed = function isSealed(object) {
//        return false;
//    };
//}
//
//// ES5 15.2.3.12
//// http://es5.github.com/#x15.2.3.12
//if (!Object.isFrozen) {
//    Object.isFrozen = function isFrozen(object) {
//        return false;
//    };
//}
//
//// ES5 15.2.3.13
//// http://es5.github.com/#x15.2.3.13
//if (!Object.isExtensible) {
//    Object.isExtensible = function isExtensible(object) {
//        // 1. If Type(O) is not Object throw a TypeError exception.
//        if (Object(object) !== object) {
//            throw new TypeError(); // TODO message
//        }
//        // 2. Return the Boolean value of the [[Extensible]] internal property of O.
//        var name = '';
//        while (owns(object, name)) {
//            name += '?';
//        }
//        object[name] = true;
//        var returnValue = owns(object, name);
//        delete object[name];
//        return returnValue;
//    };
//}

// ES5 15.2.3.14
// http://es5.github.com/#x15.2.3.14
if (!Object.keys) {
    // http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
    var hasDontEnumBug = true,
        dontEnums = [
            "toString",
            "toLocaleString",
            "valueOf",
            "hasOwnProperty",
            "isPrototypeOf",
            "propertyIsEnumerable",
            "constructor"
        ],
        dontEnumsLength = dontEnums.length;

    for (var key in {"toString": null}) {
        hasDontEnumBug = false;
    }

    Object.keys = function keys(object) {

        if ((typeof object != "object" && typeof object != "function") || object === null) {
            throw new TypeError("Object.keys called on a non-object");
        }

        var keys = [];
        for (var name in object) {
            if (owns(object, name)) {
                keys.push(name);
            }
        }

        if (hasDontEnumBug) {
            for (var i = 0, ii = dontEnumsLength; i < ii; i++) {
                var dontEnum = dontEnums[i];
                if (owns(object, dontEnum)) {
                    keys.push(dontEnum);
                }
            }
        }
        return keys;
    };

}

////
//// Date
//// ====
////
//
//// ES5 15.9.5.43
//// http://es5.github.com/#x15.9.5.43
//// This function returns a String value represent the instance in time
//// represented by this Date object. The format of the String is the Date Time
//// string format defined in 15.9.1.15. All fields are present in the String.
//// The time zone is always UTC, denoted by the suffix Z. If the time value of
//// this object is not a finite Number a RangeError exception is thrown.
//if (!Date.prototype.toISOString || (new Date(-62198755200000).toISOString().indexOf('-000001') === -1)) {
//    Date.prototype.toISOString = function toISOString() {
//        var result, length, value, year;
//        if (!isFinite(this)) {
//            throw new RangeError("Date.prototype.toISOString called on non-finite value.");
//        }
//
//        // the date time string format is specified in 15.9.1.15.
//        result = [this.getUTCMonth() + 1, this.getUTCDate(),
//            this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds()];
//        year = this.getUTCFullYear();
//        year = (year < 0 ? '-' : (year > 9999 ? '+' : '')) + ('00000' + Math.abs(year)).slice(0 <= year && year <= 9999 ? -4 : -6);
//
//        length = result.length;
//        while (length--) {
//            value = result[length];
//            // pad months, days, hours, minutes, and seconds to have two digits.
//            if (value < 10) {
//                result[length] = "0" + value;
//            }
//        }
//        // pad milliseconds to have three digits.
//        return year + "-" + result.slice(0, 2).join("-") + "T" + result.slice(2).join(":") + "." +
//            ("000" + this.getUTCMilliseconds()).slice(-3) + "Z";
//    }
//}
//
// ES5 15.9.4.4
// http://es5.github.com/#x15.9.4.4
if (!Date.now) {
   Date.now = function now() {
       return new Date().getTime();
   };
}

//
//// ES5 15.9.5.44
//// http://es5.github.com/#x15.9.5.44
//// This function provides a String representation of a Date object for use by
//// JSON.stringify (15.12.3).
//if (!Date.prototype.toJSON) {
//    Date.prototype.toJSON = function toJSON(key) {
//        // When the toJSON method is called with argument key, the following
//        // steps are taken:
//
//        // 1.  Let O be the result of calling ToObject, giving it the this
//        // value as its argument.
//        // 2. Let tv be ToPrimitive(O, hint Number).
//        // 3. If tv is a Number and is not finite, return null.
//        // XXX
//        // 4. Let toISO be the result of calling the [[Get]] internal method of
//        // O with argument "toISOString".
//        // 5. If IsCallable(toISO) is false, throw a TypeError exception.
//        if (typeof this.toISOString != "function") {
//            throw new TypeError('toISOString property is not callable');
//        }
//        // 6. Return the result of calling the [[Call]] internal method of
//        //  toISO with O as the this value and an empty argument list.
//        return this.toISOString();
//
//        // NOTE 1 The argument is ignored.
//
//        // NOTE 2 The toJSON function is intentionally generic; it does not
//        // require that its this value be a Date object. Therefore, it can be
//        // transferred to other kinds of objects for use as a method. However,
//        // it does require that any such object have a toISOString method. An
//        // object is free to use the argument key to filter its
//        // stringification.
//    };
//}
//
//// ES5 15.9.4.2
//// http://es5.github.com/#x15.9.4.2
//// based on work shared by Daniel Friesen (dantman)
//// http://gist.github.com/303249
//if (!Date.parse || Date.parse("+275760-09-13T00:00:00.000Z") !== 8.64e15) {
//    // XXX global assignment won't work in embeddings that use
//    // an alternate object for the context.
//    Date = (function(NativeDate) {
//
//        // Date.length === 7
//        var Date = function Date(Y, M, D, h, m, s, ms) {
//            var length = arguments.length;
//            if (this instanceof NativeDate) {
//                var date = length == 1 && String(Y) === Y ? // isString(Y)
//                    // We explicitly pass it through parse:
//                    new NativeDate(Date.parse(Y)) :
//                    // We have to manually make calls depending on argument
//                    // length here
//                    length >= 7 ? new NativeDate(Y, M, D, h, m, s, ms) :
//                    length >= 6 ? new NativeDate(Y, M, D, h, m, s) :
//                    length >= 5 ? new NativeDate(Y, M, D, h, m) :
//                    length >= 4 ? new NativeDate(Y, M, D, h) :
//                    length >= 3 ? new NativeDate(Y, M, D) :
//                    length >= 2 ? new NativeDate(Y, M) :
//                    length >= 1 ? new NativeDate(Y) :
//                                  new NativeDate();
//                // Prevent mixups with unfixed Date object
//                date.constructor = Date;
//                return date;
//            }
//            return NativeDate.apply(this, arguments);
//        };
//
//        // 15.9.1.15 Date Time String Format.
//        var isoDateExpression = new RegExp("^" +
//            "(\\d{4}|[\+\-]\\d{6})" + // four-digit year capture or sign + 6-digit extended year
//            "(?:-(\\d{2})" + // optional month capture
//            "(?:-(\\d{2})" + // optional day capture
//            "(?:" + // capture hours:minutes:seconds.milliseconds
//                "T(\\d{2})" + // hours capture
//                ":(\\d{2})" + // minutes capture
//                "(?:" + // optional :seconds.milliseconds
//                    ":(\\d{2})" + // seconds capture
//                    "(?:\\.(\\d{3}))?" + // milliseconds capture
//                ")?" +
//            "(?:" + // capture UTC offset component
//                "Z|" + // UTC capture
//                "(?:" + // offset specifier +/-hours:minutes
//                    "([-+])" + // sign capture
//                    "(\\d{2})" + // hours offset capture
//                    ":(\\d{2})" + // minutes offset capture
//                ")" +
//            ")?)?)?)?" +
//        "$");
//
//        // Copy any custom methods a 3rd party library may have added
//        for (var key in NativeDate) {
//            Date[key] = NativeDate[key];
//        }
//
//        // Copy "native" methods explicitly; they may be non-enumerable
//        Date.now = NativeDate.now;
//        Date.UTC = NativeDate.UTC;
//        Date.prototype = NativeDate.prototype;
//        Date.prototype.constructor = Date;
//
//        // Upgrade Date.parse to handle simplified ISO 8601 strings
//        Date.parse = function parse(string) {
//            var match = isoDateExpression.exec(string);
//            if (match) {
//                match.shift(); // kill match[0], the full match
//                // parse months, days, hours, minutes, seconds, and milliseconds
//                for (var i = 1; i < 7; i++) {
//                    // provide default values if necessary
//                    match[i] = +(match[i] || (i < 3 ? 1 : 0));
//                    // match[1] is the month. Months are 0-11 in JavaScript
//                    // `Date` objects, but 1-12 in ISO notation, so we
//                    // decrement.
//                    if (i == 1) {
//                        match[i]--;
//                    }
//                }
//
//                // parse the UTC offset component
//                var minuteOffset = +match.pop(), hourOffset = +match.pop(), sign = match.pop();
//
//                // compute the explicit time zone offset if specified
//                var offset = 0;
//                if (sign) {
//                    // detect invalid offsets and return early
//                    if (hourOffset > 23 || minuteOffset > 59) {
//                        return NaN;
//                    }
//
//                    // express the provided time zone offset in minutes. The offset is
//                    // negative for time zones west of UTC; positive otherwise.
//                    offset = (hourOffset * 60 + minuteOffset) * 6e4 * (sign == "+" ? -1 : 1);
//                }
//
//                // Date.UTC for years between 0 and 99 converts year to 1900 + year
//                // The Gregorian calendar has a 400-year cycle, so
//                // to Date.UTC(year + 400, .... ) - 12622780800000 == Date.UTC(year, ...),
//                // where 12622780800000 - number of milliseconds in Gregorian calendar 400 years
//                var year = +match[0];
//                if (0 <= year && year <= 99) {
//                    match[0] = year + 400;
//                    return NativeDate.UTC.apply(this, match) + offset - 12622780800000;
//                }
//
//                // compute a new UTC date value, accounting for the optional offset
//                return NativeDate.UTC.apply(this, match) + offset;
//            }
//            return NativeDate.parse.apply(this, arguments);
//        };
//
//        return Date;
//    })(Date);
//}

//
// String
// ======
//

// ES5 15.5.4.20
// http://es5.github.com/#x15.5.4.20
var ws = "\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003" +
    "\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028" +
    "\u2029\uFEFF";
if (!String.prototype.trim || ws.trim()) {
    // http://blog.stevenlevithan.com/archives/faster-trim-javascript
    // http://perfectionkills.com/whitespace-deviations/
    ws = "[" + ws + "]";
    var trimBeginRegexp = new RegExp("^" + ws + ws + "*"),
        trimEndRegexp = new RegExp(ws + ws + "*$");
    String.prototype.trim = function trim() {
        if (this === undefined || this === null) {
            throw new TypeError("can't convert "+this+" to object");
        }
        return String(this).replace(trimBeginRegexp, "").replace(trimEndRegexp, "");
    };
}

}());
(function() {
    var stringProto = String.prototype;
    
    if (!stringProto.startsWith) {
        stringProto.startsWith = function(prefix, position) {
            var str = this;
            
            if (position) {
                str = str.substring(position);
            }
            
            if (str.length < prefix.length) {
                return false;
            }
            
            return str.substring(0, prefix.length) == prefix;
        };
    }
    
    if (!stringProto.endsWith) {
        stringProto.endsWith = function(suffix, position) {
            var str = this;
            
            if (position) {
                str = str.substring(position);
            }
            
            if (str.length < suffix.length) {
                return false;
            }
            
            return str.slice(0 - suffix.length) == suffix;
        };
    }
}());

(function() {
    /* jshint strict:false */
    
    if ((typeof window !== 'undefined') && (window.raptorDefine !== undefined)) {
        /* global require:true */
        // TODO: Maybe in raptor-no-conflict mode the global variable names for storing the raptor define and
        //       require methods should be randomly generated so Raptor can avoid conflicting with itself?
        define = window.raptorDefine;
        require = window.raptorRequire;
        // short-circuit raptor initialization in browser environment if it already exists
        return;
    }

    var raptor, //The "raptor" module being created
        defs = {}, //Registered module definitions are added to this object
        getOrCreateDef = function(id) { //Returns the module definition entry for the given ID or creates one of one does not exist
            return (id && defs[id]) || (defs[id] = {postCreate: []});
        },
        cache = {}, //Loaded module cache
        separator = "/",
        lookup = {},
        slice = [].slice,
        isArray = Array.isArray, //Helper function to check if an object is an Array object

        /**
         * Extends an object with the properties of another object.
         *
         * @param  {Object} target The target object to extend (optional, if not provided an empty object is used as the target)
         * @param  {Object} source The source object with properties
         * @return {Object} The extended object
         */
        extend = function(target, source) { //A simple function to copy properties from one project to another
            if (!target) { //Check if a target was provided, otherwise create a new empty object to return
                target = {};
            }
            for (var propName in source) {
                if (source.hasOwnProperty(propName)) { //Only look at source properties that are not inherited
                    target[propName] = source[propName]; //Copy the property
                }
            }

            return target;
        },
        isString = function(s) {
            return typeof s == 'string';
        },
        isFunction = function(f) {
            return typeof f == 'function';
        },

        /**
         * Utility method to iterate over elements in an Array that
         * internally uses the "forEach" property of the array.
         *
         * <p>
         * If the input Array is null/undefined then nothing is done.
         *
         * <p>
         * If the input object does not have a "forEach" method then
         * it is converted to a single element Array and iterated over.
         *
         *
         * @param  {Array|Object} a An Array or an Object
         * @param  {Function} fun The callback function for each property
         * @param  {Object} thisp The "this" object to use for the callback function
         * @return {void}
         */
        forEach = function(a, func, thisp) {
            if (a != null) {
                (a.forEach ? a : [a]).forEach(func, thisp);
            }
        },

        /**
         * Invokes a provided callback for each name/value pair
         * in a JavaScript object.
         *
         * <p>
         * <h2>Usage</h2>
         * <js>
         * raptor.forEachEntry(
         *     {
         *         firstName: "John",
         *         lastName: "Doe"
         *     },
         *     function(name, value) {
         *         console.log(name + '=' + value);
         *     },
         *     this);
         * )
         * // Output:
         * // firstName=John
         * // lastName=Doe
         * </js>
         * @param  {Object} o A JavaScript object that contains properties to iterate over
         * @param  {Function} fun The callback function for each property
         * @param  {Object} thisp The "this" object to use for the callback function
         * @return {void}
         */
        forEachEntry = function(o, fun, thisp) {
            for (var k in o)
            {
                if (o.hasOwnProperty(k))
                {
                    fun.call(thisp, k, o[k]);
                }
            }
        },
        /**
         * Creates a module for the first time based on the provided factory function and provided post create functions
         * @param   {String}                   id         The ID of the module being built (not used, but simplifies code for callee)
         * @param   {Function|Object}          factory    The factory function or object instance
         * @param   {Function|Array<Function>} postCreate A function used to modify the instance before it is cached or an array of functions to modify the instance
         * @return  {Object}            [description]
         * @private
         */
        _build = function(id, factory, postCreate) {
            var instance = isFunction(factory) ? factory() : factory,
                o;

            if (postCreate) {
                forEach(postCreate, function(func) {
                    if ((o = func(instance))) { //Check if the postCreate function produced a new function...
                        instance = o; //if so, use that instead
                    }
                });
            }
            return instance;
        },
        /**
         * Wire up the prototypes to support inheritance
         *
         * @param   {Function} clazz    The constructor function
         * @param   {String} superclass The name of the super class
         * @param   {Boolean} copyProps If true, then all properties of the original prototype will be copied to the new prototype
         * @return  {Object}            The newly created prototype object with the prototypes chained together
         * @private
         */
        _inherit = function(clazz, superclass, copyProps) { //Helper function to setup the prototype chain of a class to inherit from another class's prototype
            
            var proto = clazz.prototype,
                F = function() {};
              
            var inherit = isString(superclass) ? _require(superclass) : superclass;
            
            F.prototype = inherit.prototype;
            clazz.superclass = F.prototype;

            clazz.prototype = new F();
              
            if (copyProps) {
                extend(clazz.prototype, proto);
            }
              
            return proto;
        },
        _makeClass = function(clazz, superclass, name) {
            if (!isFunction(clazz)) {
                var o = clazz;
                clazz = o.init || function() {};
                extend(clazz.prototype, o);
            }
            
            if (superclass) {
                _inherit(clazz, superclass, true);
            }

            clazz.getName = clazz.getName || function() {
                return name;
            };

            var proto = clazz.prototype;
            proto.constructor = clazz;
            proto.getClass = function() {
                return clazz;
            };
            
            return clazz;
        },
        _enumValueOrdinal = function() {
            return this._ordinal;
        },
        _enumValueName = function() {
            return this._name;
        },
        _enumValueCompareTo = function(other) {
            return this._ordinal - other._ordinal;
        },
        /**
         * Normalizes a module ID by resolving relative paths (if baseName is provided)
         * and by converting all dots to forward slashes.
         *
         * Examples:
         * normalize('test.MyClass') --> 'test/MyClass'
         * normalize('./AnotherClass', 'test/MyClass') --> 'test/AnotherClass'
         *
         * @param   {String} id       The module ID to normalize
         * @param   {String} baseName The base name for the module ID that is used to resolve relative paths. (optional)
         * @return  {String}          The normalized module ID
         * @private
         */
        _normalize = function(id, baseName) {
            if (id.charAt(0) == separator) {
                id = id.substring(1);
            }

            if (id.charAt(0) == '.') {
                if (!baseName) {
                    return id;
                }

                var baseNameParts = baseName.split(separator).slice(0, -1);

                forEach(id.split(separator), function(part, i) {
                    if (part == '..') {
                        baseNameParts.splice(baseNameParts.length-1, 1); //Remove the last element
                    }
                    else if (part != '.') {
                        baseNameParts.push(part);
                    }
                });

                return baseNameParts.join(separator);
            }
            else {
                return id.replace(/\./g, separator);
            }
        },
        /**
         * Resolves a module with specified ID or asynchronously resolves a set of modules if a callback function is provided.
         *
         * <p>
         * If a callback is provided then the {@Link raptor/loader} module is used to load the specified modules.
         *
         * @param   {String|Array}   id A String module ID or an Array of String module IDs (an Array is only allowed if a callback is provided)
         * @param   {Function} callback A callback function to use for asynchronous loading (optional)
         * @param   {Object}   thisObj  The "this" object to use for the callback function
         * @return  {Object} The loaded module (if synchronous) or the result of calling {@Link raptor/loader#load}
         */
        _require = function(id, callback, thisObj) {
            if (callback) {
                return _require('raptor/loader').load(id, callback, thisObj);
            }

            if (cache.hasOwnProperty(id)) {
                return cache[id];
            }
            
            if (raptor.exists(id)) {
                var defEntry = defs[id];
                return (cache[id] = _build(id, defEntry.factory, defEntry.postCreate));
            }
            else {
                throw new Error(id + ' not found');
            }
        },
        /**
         * These are properties that get added to all "require" functions.
         *
         * NOTE: The require function will always include a "normalize" function
         *       that can be used to normalize a module ID based on the context
         *       where the require was created
         */
        requireProps = {
            load: function(dependencies, callback) {
                var normalize = this.normalize;
                
                if (!isArray(dependencies)) {
                    dependencies = [dependencies];
                }
                
                for (var i=0, len=dependencies.length; i<len; i++) {
                    dependencies[i] = normalize(dependencies[i]);
                }

                return _require(dependencies, callback);
            },
            
            exists: function(id) {
                return raptor.exists(this.normalize(id));
            },
            
            find: function(id) {
                
                return raptor.find(this.normalize(id));
            }
        },
        /**
         * These are properties that get added to all "define" functions.
         *
         * NOTE: The define function will always include a "require" function
         *       that can be used to require other modules.
         */
        defineProps = {
            extend: function() {
                return _define(arguments, this.require, 0, 1);
            },

            Class: function() {
                return _define(arguments, this.require, 1);
            },

            Enum: function() {
                return _define(arguments, this.require, 0, 0, 1);
            }
        },
        _extendDefine = function(define) {
            //Unfortunately functions cannot have custom prototypes so we much manually copy properties for each new instance
            return extend(define, defineProps);
        },
        _extendRequire = function(require) {
            return extend(require, requireProps);
        },
        /**
         * This functions takes in the arguments to define, define.Class and define.extend
         * calls and does the hard work of handling optional arguments.
         *
         * @param   {arguments}  args The arguments object for the define, define.Class or define.extend
         * @param   {Function}  simpleRequire The function that should be used to actually perform the require of an object
         * @param   {Boolean} isClass Should only be true if this is define.Class call
         * @param   {Boolean} isExtend Should only be true if this is a define.extend call
         * @return  {Object|undefined} If no id is provided then the anonymous object is immediately built and returned. Otherwise, undefined is returned.
         * @private
         */
        _define = function(args, simpleRequire, isClass, isExtend, isEnum) {
            var i=0,
                last = args.length-1,
                finalFactory, //The function that wraps the user provided factory function to handle building the correct arguments to the user function
                arg,
                id, //The object id (optional)
                superclass, //The superclass (optional, should only be allowed for define.Class but that is not enforced currently...less code)
                enumValues,
                dependencies = [], //The dependencies arguments... defaults to an empty array
                postCreate, //A function that should be invoked after the object is created for the first time...Used to handle inheritance and to apply an extension
                factory, //The factory function or object definition (required, always the last argument)
                require = _extendRequire(function(requestedId, callback) { //This is the "require" function that the user code will see...Need to add the required props
                    return callback ?
                        require.load(requestedId, callback) :
                        simpleRequire(requestedId, id); //Pass along the requested ID and the base ID to the require implementation
                }),
                module = new Module(require), //Create a module object
                exports = module.exports, //Use the exports associated with the module object
                local = { //Map local functions and objects to names so that the names can be explicitly used. For example: define(['require', 'exports', 'module'], function(require, exports, module) {})
                    require: require,
                    exports: exports,
                    module: module
                },
                getSuperclass= function() {
                    return (superclass = isString(superclass) ? require(superclass) : superclass);
                },
                _gather = function() { //Converts an array of dependency IDs to the actual dependency objects (input array is modified)
                    forEach(dependencies, function(requestedId, i) {
                        if (isString(requestedId)) {
                            var d;

                            if (!(d = local[requestedId])) { //See if the requested module is a local module and just use that module if it is
                                d = requestedId == 'super' ? getSuperclass().prototype : simpleRequire(requestedId, id); //Not a local module, look it up...they will do the normalization
                            }

                            dependencies[i] = d;
                        }
                    });

                    return dependencies;
                };

            require.normalize = function(requestedId) { //Helper function to normalize a module based on the parent define for the require
                return _normalize(requestedId, id);
            };

            /*
             Loop through the arguments to sort things out...
             */
            for (; i<last; i++) {
                arg = args[i];
                if (isString(arg)) { //We found a string argument
                    if (id) { //If we already found an "id" then this string must be the superclass
                        superclass = _normalize(arg, id);
                    }
                    else { //Otherwise it is the module ID
                        id = module.id = _normalize(arg);
                    }
                }
                else if (isArray(arg)) { //We found an array...The argument must be the array of dependency IDs
                    dependencies = arg;
                }
                else if (isEnum) {
                    enumValues = arg;
                }
                else {
                    superclass = arg.superclass;
                }
            }
            
            factory = args[last]; //The factory function is always the last argument


            if (isExtend) { //If define.extend then we need to register a "post create" function to modify the target module
                postCreate = function(target) {
                    if (isFunction(factory)) {
                        factory = factory.apply(raptor, _gather().concat([require, target]));
                    }
                    
                    if (factory) {
                        extend(isFunction(target) ? target.prototype : target, factory);
                    }
                };
            }
            else {
                if (isClass || superclass) {
                    postCreate = function(instance) {
                        return _makeClass(instance, getSuperclass(), id);
                    };
                }
                else if (isEnum) {

                    if (isArray(factory)) {
                        enumValues = factory;
                        factory = null;
                    }

                    postCreate = function(EnumClass) {
                        if (EnumClass) {
                            if (typeof EnumClass == 'object') {
                                EnumClass = _makeClass(EnumClass, 0, id); // Convert the class object definition to
                                                                          // a class constructor function
                            }
                        } else {
                            EnumClass = function() {};
                        }

                        var proto = EnumClass.prototype,
                            count = 0,
                            _addEnumValue = function(name, EnumCtor) {
                                return extend(
                                    EnumClass[name] = new EnumCtor(),
                                    {
                                        _ordinal: count++,
                                        _name: name
                                    });
                            };

                        if (isArray(enumValues)) {
                            forEach(enumValues, function(name) {
                                _addEnumValue(name, EnumClass);
                            });
                        }
                        else if (enumValues) {
                            var EnumCtor = function() {};
                            EnumCtor.prototype = proto;

                            forEachEntry(enumValues, function(name, args) {
                                EnumClass.apply(_addEnumValue(name, EnumCtor), args || []);
                            });
                        }

                        EnumClass.valueOf = function(name) {
                            return EnumClass[name];
                        };

                        extend(proto, {
                            name : _enumValueName,
                            ordinal : _enumValueOrdinal,
                            compareTo : _enumValueCompareTo
                        });

                        if (proto.toString == Object.prototype.toString) {
                            proto.toString = _enumValueName;
                        }

                        return EnumClass;
                    };
                }


                

                finalFactory = isFunction(factory) ?
                    function() {
                        var result = factory.apply(raptor, _gather().concat([require, exports, module]));
                        return result === undefined ? module.exports : result;
                    } :
                    factory;
            }

            return raptor.define(id, finalFactory, postCreate);
        },
        Module = function(require) {
            var _this = this;
            _this.require = require;
            _this.exports = {};
        };

    Module.prototype = {
        logger: function() {
            var _this = this;
            return _this.l || (_this.l = _require('raptor/logging').logger(_this.id));
        }
    };

    /**
     * The core raptor module provides an AMD implementation that can be used
     * on the server or in the web browser.
     *
     * @module
     * @name raptor
     * @raptor
     */
    raptor = {
        cache: cache,
        
        inherit: _inherit,

        extend: extend,

        forEach: forEach,
        
        /**
         * Converts a native arguments object to a native JavaScript
         * Array.
         *
         * @param  {arguments} args The arguments object
         * @param  {int} startIndex The starting index (optional)
         * @return {Array} The native JavaScript error
         */
        arrayFromArguments: function(args, startIndex) {
            if (!args) {
                return [];
            }
            
            if (startIndex) {
                return startIndex < args.length ? slice.call(args, startIndex) : [];
            }
            else
            {
                return slice.call(args);
            }
        },
        
        forEachEntry: forEachEntry,
        
        /**
         * Creates an Error object with the root cause stored. In addition,
         * this method normalizes how stack traces are recorded
         * across environments.
         *
         * <p>
         * Recommended usage:
         * <ul>
         *  <li><js>throw raptor.createError(new Error('Invalid. Exception: ' + cause), cause);</js></li>
         *  <li><js>throw raptor.createError(new Error('Invalid'));</js></li>
         * </ul>
         *
         * @param  {String|Error} message An error message or an Error object
         * @param  {Error} cause The cause of the error
         * @return {Error} The resulting Error object that can then be thrown.
         */
        createError: function(message, cause) {
            var error,
                argsLen = arguments.length,
                E = Error;
            
            if (argsLen == 2)
            {
                error = message instanceof E ? message : new E(message);
                error._cause = cause;
            }
            else if (argsLen == 1)
            {
                if (message instanceof E)
                {
                    error = message;
                }
                else
                {
                    error = new E(message);
                }
            }
            
            return error;
        },

        setImplicitId: function(id) {
            this._implicitId = id;
        },

        /**
         * Registers a factory function or object with an ID.
         *
         * NOTE: This function does no normalization of module IDs
         *       and it executes the factory function with no arguments.
         *
         * @param  {String}          id         The ID of the object being defined
         * @param  {Function|Object} factory    The factory function or Object instance
         * @param  {Function}        postCreate A function to execute after the object is created for the first time (optional)
         * @return {Object} Returns undefined if an "id" is provided. If an "id" is provided then the object is immediately built and returned.
         */
        define: function(id, factory, postCreate) {
            var instance;
            if (!id) {
                if (!this._implicitId) {
                    return _build.apply(raptor, arguments);
                }
                
                id = this._implicitId;
                this._implicitId = undefined;
            }

            var def = getOrCreateDef(id);
            if (factory) {
                def.factory = factory;
            }
            
            if (postCreate) {
                def.postCreate.push(postCreate);

                if ((instance = cache[id])) {
                    postCreate(instance);
                }
            }
            
            if (typeof instance == 'object' && instance.toString === Object.prototype.toString) {
                instance.toString = function() {
                    return '[' + id + ']';
                };
            }

        },

        /**
         * Returns true if a RaptorJS AMD module with specified ID exists, false otherwise.
         *
         * @param  {String} id The ID of a module
         * @return {Boolean} true if a RaptorJS AMD module with specified ID exists, false otherwise.
         */
        exists: function(id) {
            return defs.hasOwnProperty(id);
        },
        
        /**
         * Returns an initialized RaptorJS AMD module with specified ID if it exists, undefined otherwise.
         *
         * @param  {String} id The ID of a module
         * @return {Object} an initialized RaptorJS AMD module with specified ID if it exists, undefined otherwise
         */
        find: function(id) {
            return raptor.exists(id) ? raptor.require(id) : undefined;
        },

        require: _require,

        normalize: _normalize,

        _define: _define,

        props: [requireProps, defineProps]
    };  //End raptor

    var _global;

    if (typeof window !== 'undefined') {
        // browser environment
        _global = window;

        /*global require:true */
        var defineRequire = defineProps.require = function(id, baseName) {
            return _require(_normalize(id, baseName));
        };
        
        // always export raptorDefine function to global scope (this should not cause a conflict)
        window.raptorDefine = define = _extendDefine(
            function() {
                return _define(arguments, defineRequire);
            });

        // always export raptorRequire function to global scope (this should not cause a conflict)
        window.raptorRequire = require = _extendRequire(function(id, callback) {
            return isFunction(callback) ?
                require.load(id, callback) :
                _require(_normalize(id));
        });

        if (typeof raptorNoConflict === 'undefined' || raptorNoConflict !== true) {
            // We are not in no-conflict mode so expose define and require.
            // Put AMD-style define and require functions in the global window scope.
            window.define = raptorDefine;
            window.require = raptorRequire;
        }
        
        require.normalize = _normalize;

        define.amd = {};
    }
    else {
        // server-side environment
        _global = global;
        module.exports = raptor;
    }
    
    raptor.define('raptor', raptor);
    
    /*
    The below code adds global lookup related functions that can always used
    look up objects by keys or to look up an array of objects by key. These
    functions are used by compiled code only and should not be used by
    user code directly.
    TODO: provide a "raptor/lookup" module for user code
     */
    


    extend(_global, {
        /**
         * @param  {String} category The category name for the object being added to the lookup
         * @param  {String} key      The object key
         * @param  {Object} data     The object to associate with the key
         * @return {void}
         */
        $rset: function(category, key, data) {
            
            if (typeof key === 'object'){
                forEachEntry(key, function(k, v){
                    $rset(category, k, v);
                });
            } else {
                var catData = lookup[category];
                if (!catData) {
                    catData = lookup[category] = {};
                }
                if (data !== undefined) {
                    catData[key] = data;
                }
                else {
                    delete catData[key];
                }
            }
            
        },

        $radd: function(category, data) {
            var catData = lookup[category];
            if (!catData) {
                catData = lookup[category] = [];
            }
            catData.push(data);
        },

        $rget: function(category, key) {
            var catData = lookup[category];
            return arguments.length == 2 ? catData && catData[key] : catData;
        },

        $rdef: function(name) {
            var def = function() {
                define.apply(this,[name].concat(raptor.arrayFromArguments(arguments)));
            };

            def.amd = {};

            return def;
        }
    });

    
    raptor.global = _global;
}());
/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


define('raptor/logging', ['raptor'], function(raptor) {
    /*jshint strict:false */
    
    /**
     * @class
     * @name raptor/logging/VoidLogger
     */
    
    /**
     *
     */
    var EMPTY_FUNC = function() {
            return false;
        },
        /**
         * @name raptor/logging/voidLogger
         */
        voidLogger = {
            
            /**
             *
             */
            isTraceEnabled: EMPTY_FUNC,

            /**
             *
             */
            isDebugEnabled: EMPTY_FUNC,
            
            /**
             *
             */
            isInfoEnabled: EMPTY_FUNC,
            
            /**
             *
             */
            isWarnEnabled: EMPTY_FUNC,
            
            /**
             *
             */
            isErrorEnabled: EMPTY_FUNC,
            
            /**
             *
             */
            isFatalEnabled: EMPTY_FUNC,
            
            /**
             *
             */
            dump: EMPTY_FUNC,
            
            /**
             *
             */
            trace: EMPTY_FUNC,

            /**
             *
             */
            debug: EMPTY_FUNC,
            
            /**
             *
             */
            info: EMPTY_FUNC,
            
            /**
             *
             */
            warn: EMPTY_FUNC,
            
            /**
             *
             */
            error: EMPTY_FUNC,
            
            /**
             *
             */
            fatal: EMPTY_FUNC
        };

    return {
        /**
         *
         * @param className
         * @returns
         */
        logger: function(className)
        {
            return voidLogger;
        },
        
        configure: EMPTY_FUNC,
        
        voidLogger: voidLogger
    };

});

/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define('raptor/listeners', ['raptor'], function(raptor, require) {
    "use strict";
    
    var forEachEntry = raptor.forEachEntry,
        isArray = Array.isArray,
        extend = raptor.extend,
        nextHandleId = 0,
        handlesPropName = "__lstnrs",
        EMPTY_FUNC = function() {},
        listeners,
        _bind = function(callbackFunc, thisObj) {
            if (!callbackFunc) return EMPTY_FUNC;
            if (!thisObj) return callbackFunc;
            return function() {
                callbackFunc.apply(thisObj, arguments);
            };
        },
        _cleanupListeners = function(listeners) {
            var newListeners = [],
                thisObj;
            
            listeners._listeners.forEach(function(curListener) {
                
                if (curListener.removed) {
                    if ((thisObj = curListener.thisObj)) {
                        delete thisObj[handlesPropName][curListener.id];
                    }
                } else {
                    newListeners.push(curListener);
                }
            });
            
            listeners._listeners = newListeners;
            
            if (!listeners._listeners.length) {
                listeners._onEmpty();
            }
            
        },
        _removeListener = function(listeners, listener) {
            listener.removed = true;
            _cleanupListeners(listeners);
        },
        _createRemoveListenerFunc = function(listeners, listener) {
            return function() {
                _removeListener(listeners, listener);
            };
        },
        _createRemoveObservableFunc = function(handles) {
            return function(name) {
                if (!arguments.length) {
                    forEachEntry(handles, function(name, h) {
                        h.remove();
                    });
                }
                else
                {
                    var handle = handles[name];
                    if (!handle) {
                        throw raptor.createError(new Error('Invalid message name: ' + name));
                    }
                    handle.unsubscribe();
                }
            };
        };
        
    /**
     * The Message class allows additional information to be provided to subscribers.
     *
     * @class
     * @anonymous
     * @name raptor/listeners/Message
     *
     * @param name {String} The name of the message
     * @param props {Object} An object with properties that should be applied to the newly created message
     */
    var Message = function(name, data) {
        this.name = name;
        this.data = data;
    };
    
    Message.prototype = {
        /**
         * Return the message name.
         *
         * @returns {String} The name of the message
         */
        getName: function() {
            return this.name;
        },
        
        /**
         * Return the message data.
         *
         * @returns {Object} The data for the message
         */
        getData: function() {
            return this.data;
        }
    };
    
    /**
     * @name raptor/listeners/Listeners
     * @anonymous
     * @class
     */
    var Listeners = function() {
        this._listeners = [];
        this._onEmpty = EMPTY_FUNC;
    };
    
    Listeners.prototype = {
        /**
         *
         * @param callback
         * @param thisObj
         * @param autoRemove
         * @returns {raptor/listeners/ListenerHandle} A listener handle
         */
        add: function(callback, thisObj, autoRemove) {
            var _this = this,
                removeFunc,
                listener = {
                    callback: callback,
                    thisObj: thisObj,
                    removed: false,
                    autoRemove: autoRemove,
                    id: nextHandleId++
                },
                handles;
            
            removeFunc = listener.remove = _createRemoveListenerFunc(_this, listener);
            
            _this._listeners.push(listener);
                        
            /**
             * @name raptor/listeners/ListenerHandle
             * @anonymous
             * @class
             */
            var handle = {
                /**
                 * @returns {void}
                 */
                remove: removeFunc
                
                /**
                 * Removes the added listener
                 *
                 * @function
                 * @memberOf raptor/listeners/ListenerHandle.prototype
                 * @name unsubscribe
                 *
                 *
                 */
            };

            /**
             * Removes the added listener
             */
            handle.unsubscribe = handle.remove;
            
            if (thisObj) {
                
                if (!(handles = thisObj[handlesPropName])) {
                    handles = thisObj[handlesPropName] = {};
                }
                handles[listener.id] = handle;
            }

            return handle;
            
        },
        
        
        
        /**
         * Publishes a message to the listeners in this list
         * @param args
         */
        publish: function() {
            var args = arguments,
                _this = this;
            
            _this._listeners.forEach(function(listener) {
                if (listener.removed) return;
                
                listener.callback.apply(listener.thisObj, args);
                
                if (listener.autoRemove)
                {
                    _removeListener(_this, listener);
                }
            });
        },
        
        /**
         *
         * @param callback
         * @param thisObj
         */
        onEmpty: function(callback, thisObj) {
            this._onEmpty = _bind(callback, thisObj);
        },

        removeAll: function() {
            var listeners = this._listeners;
            for (var i = 0; i < listeners.length; i++) {
                // flag listener for removal
                listeners[i].removed = true;
            }
            // remove all of the listeners that have been flagged for removal
            _cleanupListeners(this);
        },

        removeObserver: function(observer) {
            var listeners = this._listeners;
            for (var i = 0; i < listeners.length; i++) {
                var listener = listeners[i];
                if (listener.thisObj === observer) {
                    // flag listener for removal
                    listener.removed = true;
                }
            }
            // remove all of the listeners that have been flagged for removal
            _cleanupListeners(this);
        }
    };
    
    var checkMessage = function(messageName, observable) {
        var allowedMessages = observable._allowed;
        if (allowedMessages && !allowedMessages[messageName]) {
            throw new Error('Invalid message name of "' + messageName + '". Allowed messages: ' + Object.keys(allowedMessages).join(', '));
        }
        
    };
    
    
    var _createMessageFunc = function(name) {
        return function(props) {
            var args = [name].concat(Array.prototype.slice.call(arguments));
            this[typeof props == 'function' ? 'subscribe' : 'publish'].apply(this, args);
        };
    };
    
    function Observable_subscribe(name, callback, thisObj, autoRemove) {
        var _this = this,
            handles,
            handle;
        
        if (typeof name == 'object')
        {
            autoRemove = thisObj; //autoRemove is the third argument
            thisObj = callback; //thisObj is the second argument
            
            handles = {};
            
            forEachEntry(name, function(name, callback) {
                handles[name] = _this.subscribe(name, callback, thisObj, autoRemove);
                
            });
            
            /**
             * @class
             * @anonymous
             * @name raptor/listeners/ObservableListenerHandle
             */
            handle = {
                
                /**
                 * @function
                 * @param {string} name The message name to unsubscribe from (optional, if not specified then the listeners for all messages will be removed)
                 * @returns
                 */
                unsubscribe: _createRemoveObservableFunc(handles)
                
                /**
                 * @function
                 * @name remove
                 * @memberOf raptor/listeners/ObservableListenerHandle.prototype
                 *
                 * @param type
                 * @returns
                 *
                 * @deprecated
                 */
                
                /**
                 * @function
                 * @name removeAll
                 * @memberOf raptor/listeners/ObservableListenerHandle.prototype
                 * @returns
                 * @deprecated
                 */
            };
            
            handle.remove = handle.removeAll = handle.unsubscribe;
            
            return handle;
        }
        
        checkMessage(name, _this);
        
        var listenersInstance = _this._byName[name];
        if (!listenersInstance)
        {
            _this._byName[name] = listenersInstance = new Listeners();
            
            
            //Prevent a memory leak by removing empty listener lists
            listenersInstance.onEmpty(function() {
                delete _this._byName[name];
            });
        }
        return listenersInstance.add(callback, thisObj, autoRemove);
    }

    /**
     * @class
     * @anonymous
     * @name raptor/listeners/Observable
     */
    var Observable = function() {
        if (!this._byName) {
            this._byName = {};
        }
    };
    
    Observable.prototype = {
        __observable: true,
        
        /**
         * @param events {Array.<String>} An array of event names to register
         * @param createPublishFunctions
         */
        registerMessages: function(messages, createPublishFunctions) {
            if (!this._allowed) {
                this._allowed = {};
            }
            
            for (var i=0, len=messages.length; i<len; i++) {
                var message = messages[i];
                this._allowed[message] = true;
                
                if (createPublishFunctions) {
                    this[message] = _createMessageFunc(message);
                }
            }
            
        },
        
        
        /**
         * Registers a listener or a set of listeners for the provided event types.
         *
         * Two signatures are supported:
         * <ol>
         * <li> eventHandle subscribe(type, callback, thisObj, autoRemove)</li>
         * <li> eventHandle subscribe(callbacks, thisObj, autoRemove)</li>
         * </ol>
         *
         * @param name {String} The message name
         * @param callback {Function} The callback function
         * @param thisObj
         * @param autoRemove
         * @returns {raptor/listeners/ObservableListenerHandle} A handle to remove the added listeners or select listeners
         */
        subscribe: Observable_subscribe,
        on: Observable_subscribe,

        unsubscribeAll : function() {
            forEachEntry(this._byName, function(name, listeners) {
                listeners.removeAll();
            });

            this._byName = {};
        },

        /**
         * This method is used to remove any listeners that the given
         * observer created. The given observer should have been provided
         * to the subscribe/on method as the "thisObj" argument.
         */
        unsubscribeObserver: function(observer) {
            // remove all listener istances whose "thisObj" is the given observer
            //var handles = observer[handlesPropName];
            forEachEntry(this._byName, function(name, listeners) {
                listeners.removeObserver(observer);
            });
        },
        
        /**
         * Publishes a message with the specified name.
         *
         * Arguments can be passed to the subscribers by providing zero or more arguments after the topic name argument
         *
         * Example code:
         * <js>
         * //Simple string as argument
         * someObj.publish('myMessage', 'Hello World!');
         *
         * //Multiple arguments
         * someObj.publish('myMessage', 'Hello World!', 'John Doe');
         * </js>
         *
         * @param name {String|raptor/listeners/Message} The message name or a Message object that has the message name and args as properties.
         * @param props {Object|Array} Properties to apply to the published message object
         */
        publish: function(name, message) {
            
            var args;
            
            if (isArray(message)) {
                args = message;
            }
            else {
                if (listeners.isMessage(name)) {
                    message = name;
                    name = message.getName();
                }
                else {
                    message = listeners.createMessage(name, message);
                }
                args = [message.data, message];
            }
            
            
            checkMessage(name, this);
           
            var _this = this;
            
            var _publish = function(name) {
                var listenersInstance = _this._byName[name];
                if (!listenersInstance) return;
                
                listenersInstance.publish.apply(listenersInstance, args);
            };
            
            _publish(name);
            _publish('*');
            
            var lastDot = name.lastIndexOf('.');
            if (lastDot >= 0)
            {
                _publish(name.substring(0, lastDot+1) + '*');
            }
            
            return message;
        }
    };

    listeners = {
        /**
         * @type raptor/listeners/Message
         *
         */
        Message: Message,
        
        /**
         * Creates a new listener list and returns it.
         *
         * @returns {raptor/listeners/Listeners} The newly created {@link raptor/listeners/Listeners} object.
         */
        createListeners: function() {
            return new Listeners();
        },
        
        /**
         * Creates a new observable object and returns it.
         *
         * @param allowedMessages {Array<String>} An array of messages that are allowed (more can be added later using {@Link .registerMessages}). Optional
         *
         * @returns {raptor/listeners/Observable} The newly created {@link raptor/listeners/Observable} object.
         */
        createObservable: function(allowedMessages, createFunctions) {
            var o = new Observable();
            if (allowedMessages) {
                o.registerMessages(allowedMessages, createFunctions);
            }
            return o;
        },
        
        /**
         *
         * Makes an existing object/class observable by extending the target with the required methods and properties from the {@link raptor/listeners/Observable} class.
         * <ul>
         * <li>{@link raptor/listeners/Observable#subscribe}</li>
         * <li>{@link raptor/listeners/Observable#publish}</li>
         * </ul>
         *
         * <p>
         * Example code:
         * <js>
         * var someObj = {};
         * listeners.makeObservable(someObj);
         *
         * someObj.subscribe("someEvent", function() { ... });
         * someObj.publish("someEvent", ...);
         * </js>
         *
         * @param obj {Object} The instance object to make observable
         * @param proto {prototype} The prototype to apply the Observable methods to. If not provided then the methods are applied directly to the object provided as the first argument.
         *
         * @return {void}
         */
        makeObservable: function(obj, proto, allowedMessages, createFunctions) {
            if (!proto) {
                proto = obj;
            }
            
            if (!proto.__observable) {
                extend(proto, Observable.prototype);
            }
            
            Observable.call(obj);
            
            if (allowedMessages) {
                obj.registerMessages(allowedMessages, createFunctions);
            }
        },
        
        isObervable: function(o) {
            return o && o.__observable;
        },
        
        /**
         *
         * @param name
         * @param props
         * @returns {raptor/listeners/Message}
         */
        createMessage: function(name, data) {
            return new Message(name, data);
        },
        
        /**
         *
         * @param o
         * @returns {Boolean}
         */
        isMessage: function(o) {
            return o instanceof Message;
        },
        
        /**
         * @function
         * @param callbackFunc
         * @param thisObj
         */
        bind: _bind,
        
        /**
         * Unsubscibes a listener from all of the messages that it has subscribed to.
         *
         * This method works because all listener handles are registered with the
         * message subscriber (i.e. the "thisObj" provided when subscribing to a message).
         *
         * When a message is unsubscribed for a subscriber then the listener handle is
         * deregistered.
         *
         * @param thisObj The subscriber to unsubscribe from all messages
         */
        unsubscribeFromAll: function(thisObj) {
            var handles = thisObj[handlesPropName];
            if (handles) {
                for (var k in handles) {
                    handles[k].unsubscribe();
                }
            }
        }
    };

    return listeners;
});


$rset('loaderMeta',{});
/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @extension Module Loader
 */
define.extend('raptor/loader', function(require) {
    "use strict";
    
    var logger = require('raptor/logging').logger('raptor/loader'),
        raptor = require('raptor'),
        forEach = raptor.forEach,
        extend = raptor.extend;
    
    var handle_require = function(requireId, transaction) {
        
        //See if the require already exists

        if (require.exists(requireId)) {
            return; //Module already available... nothing to do
        }
        
        //If the require has already been included as part of this transaction then nothing to do
        if (transaction.isIncluded(requireId)) {
            return;
        }
        
        //Mark the require as being part of this transaction
        transaction.setIncluded(requireId);
        
        var missing = function() {
            throw new Error('Dependencies missing: "' + requireId + '"');
        };
        
        //The metadata for the requires should have been serialized to a global variable
        //This information is required so that we know what the dependencies are for the require
        /*
        var asyncModulesMetadata = raptor.global.$rloaderMeta;
        
        if (!asyncModulesMetadata) {
            //Can't load the require if there is no metadata for any of the requires
            missing();
        }
        */
        
        //Now load the metadata for the requested requireId
        var metadata =  $rget('loaderMeta', requireId);
        
        if (!metadata) {
            //No metadata data found for this require... Throw an error
            missing();
        } else {     
            //Include all of the requires that this require depends on (if any)
            transaction.add('requires', metadata.requires);
            
            //Include all of the CSS resources that are required by this require (if any)
            transaction.add('js', metadata.js);
            
            //And include all of the JS resources that are required by this require (if any)
            transaction.add('css', metadata.css);
        }
    };
    
    return {
        handle_require: handle_require,
        handle_requires: handle_require,

        /**
         * Includes the specified requires asynchronously and invokes the callback methods in the provided callback for the supported events.
         * 
         * <p>The loaded requires will be passed to the success callback in the order that the requires are specified. 
         * 
         * @param requires {String|Array<String>} A require name or an array of require names
         * @param callback {Function|Object} Either a success/error callback function or an object with event callbacks. Supported events: asyncStart, success, error, asyncComplete, complete
         * @param thisObj The "this" object to use for the callback functions
         * 
         * @returns {raptor/loader/Transaction} The transaction for the asynchronous loading of the require(s)
         */
        load: function(requires, callback, thisObj) {
            var userSuccessFunc, //A reference to the user's success callback (if provided)
                wrappedCallback,
                isFunctionCallback = typeof callback === 'function';
            
            if ((userSuccessFunc = (isFunctionCallback ? callback : callback.success))) {
                //We want to pass the loaded requires as arguments to the success callback and that
                //is something the "loader" require will not do for us since it deals with objects
                //of mixed types (including CSS resources, JS resources and requires). To solve
                //that problem we are going to wrap the user success callback with our own
                //and have it be a proxy to the user's success callback
                
                //Copy all of the callback properties to a new object
                wrappedCallback = typeof callback !== "function" ? extend({}, callback) : {};
                
                //Now replace the success callback with our own. NOTE: We have already saved a reference to the user's success callback
                wrappedCallback.success = function() {
                    //Everything has finished loading so now let's go back through the require names and get the references
                    //to the loaded requires and added to the loadedModules array which will be passed to the success callback
                    var loadedModules = [];
                    try
                    {
                        forEach(requires, function(requireId) {
                            loadedModules.push(require.exists(requireId) ? require(requireId) : null); //Loading the require for the first time might trigger an error if there is a problem inside one of the factory functions for the required requires
                        });
                    }
                    catch(e) {
                        //Log the error since this happened in an asynchronous callback
                        logger.error(e);
                        
                        //If an error happens we want to make sure the error callback is invoked
                        if (wrappedCallback.error) {
                            wrappedCallback.error.call(thisObj);
                        }
                        return;
                    }
                    
                    //Everything loaded successfully... pass along the required requires to the user's success callback function
                    userSuccessFunc.apply(thisObj, loadedModules);
                };
                
                if (isFunctionCallback) {
                    //A single function as we provided as a callback that is used for both success and error. Thereore, we need to also
                    //wrap the error callback and invoke the provided callback with no arguments to indicate an error
                    wrappedCallback.error = function() {
                        //Call the success callback with no requires to indicate an error
                        userSuccessFunc.call(thisObj);
                    };
                }
                
            }
            
            //Create a new transaction that consists of the requested requires and execute it
            return this.include(
                {
                    requires: requires
                }, 
                wrappedCallback || callback, 
                thisObj);
        }
        
    };
});
/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * The RaptorJS loader module allows JavaScript, CSS and modules to be included in the page asynchronously after the page
 * has already finished loading. The loader module supports including individual resources or including multiple resources
 * of possibly mixed types as a single transaction. 
 * 
 * <p>
 * When including a resource or a set of resources a callback can
 * be provided to track the progress of the include. 
 * 
 * 
 */
define('raptor/loader', ['raptor'], function(raptor, require, exports, module) {
    "use strict";
    
    var included = {},
        downloaded = {},
        forEach = raptor.forEach,
        forEachEntry = raptor.forEachEntry,
        listeners = require('raptor/listeners'),
        events = ['asyncStart', 'asyncComplete', 'success', 'error', 'complete'],
        _createAsyncCallback = function(callback, thisObj) {
            var observable = listeners.createObservable(events, true);
            if (callback) {
                if (typeof callback === 'function') {
                    observable.complete(callback, thisObj);
                }
                else {
                    //Assume the callback is an object
                    observable.subscribe(callback, thisObj);
                }
            }
            return observable;
        },
        progressEvents = listeners.createObservable(),
        _handleUrlStart = function(url, callback) {
            var data = downloaded[url];
                
            if (data) {

                if (data.success) {
                    callback.success(data);
                }
                else {
                    callback.error(data);
                }
                callback.complete(data);
                return true;
            }
            else if ((data = included[url])) {
                callback.asyncStart(data);
                
                //Piggy-back off the existing include for the remaining events
                forEach(
                    events,
                    function(event) {
                        if (event === 'asyncStart') {
                            //Skip the "asyncStart" event since already handled that
                            return;
                        }
                        progressEvents.subscribe(event + ':' + url, function(data) {
                            callback.publish(event, data);
                        }, this, true /*auto remove*/);
                    }, this);
                return true;
            }

            included[url] = data = {url: url, completed: false};
            
            callback.asyncStart(data);
            return false;
        },
        _handleUrlComplete = function(url, isSuccess, callback) {
            var data = included[url];
            delete included[url];
            
            data.success = isSuccess;
            data.complete = true;
            
            var _publish = function(event) {
                callback[event](data);
                progressEvents.publish(event + ':' + url, data);
            };
            
            if (isSuccess) {
                downloaded[url] = data;
                _publish('success');
                
            }
            else {
                _publish('error');
            }
            
            _publish('asyncComplete');
            _publish('complete');
        },
        _createImplCallback = function(url, callback) {
            return {
                success: function() {
                    _handleUrlComplete(url, true, callback);
                },
                error: function() {
                    _handleUrlComplete(url, false, callback);
                }
            };
        };
        
    /**
     * A transaction consisting of resources to be included.
     * 
     * @class
     * @anonymous
     * @name raptor/loaderTransaction
     * 
     * @param loader {loader} The loader module that started this transaction 
     */
    var Transaction = function(loader) {
        
        var _includes = [],
            _included = {},
            started,
            _this = {
                
                /**
                 * Adds a include to the transaction
                 * 
                 * @param url {String} The URL/ID of the include
                 * @param include {Object} The data for the include
                 * @param includeFunc The function to actually include the resource (a callback will be provided)
                 * @param thisObj The "this" object ot use for the includeFunc arg
                 */
                _add: function(url, include, includeFunc, thisObj) {
                    if (started || _included[url]) {
                        return;
                    }
                    
                    _included[url] = 1;
                    
                    _includes.push(function(callback) {
                        if (_handleUrlStart(url, callback)) {
                            return;
                        }
                        
                        includeFunc.call(
                                thisObj, 
                                include, 
                                _createImplCallback(url, callback));
                    });
                },
                
                /**
                 * 
                 * @param url
                 * @returns {Boolean} Returns true if the  URL has already been included as part of this transaction. False, otherwise.
                 */
                isIncluded: function(url) {
                    return !!_included[url];
                },
                
                /**
                 * Marks a URL as included
                 * 
                 * @param url The URL to mark as included
                 */
                setIncluded: function(url) {
                    _included[url] = 1;
                },
                
                /**
                 * 
                 * @param type The resource type (e.g. "js", "css" or "module"
                 * @param includes {Object|Array} The array of includes or a single include 
                 */
                add: function(type, includes) {
                    
                    var handler = loader["handle_" + type];
                    
                    if (handler == null) {
                        throw new Error("Invalid type: " + type);
                    }
                    
                    forEach(includes, function(include) {
                        handler.call(loader, include, _this);
                    });
                },
                        
                /**
                 * 
                 * @param userCallback
                 * @returns {raptor/loader/Transaction} Returns itself
                 */
                execute: function(userCallback) {
                    started = 1;
                    
                    var failed = [],
                        status = {failed: failed};
                    
                    if (!_includes.length) {
                        userCallback.success(status);
                        userCallback.complete(status);
                    }
                    
                    var completedCount = 0,
                        asyncStarted = false,
                        callback = _createAsyncCallback({
                                asyncStart: function() {
                                    if (!asyncStarted) {
                                        asyncStarted = true;
                                        userCallback.asyncStart(status);
                                    }
                                },
                                error: function(url) {
                                    failed.push(url);
                                }, 
                                complete: function() {
                                    completedCount++;
                                    if (completedCount === _includes.length) {
                                        
                                        if ((status.success = !failed.length)) {
                                            userCallback.success(status);
                                        }
                                        else {
                                            userCallback.error(status);
                                        }
                                        
                                        if (asyncStarted) {
                                            userCallback.asyncComplete(status);
                                        }
            
                                        userCallback.complete(status);
                                    }
                                }
                            });
                    
                    
                    
                    forEach(_includes, function(execFunc) {
                        execFunc(callback);
                    });
                    return _this;
                }
            };
        
        return _this;
    };

    return {
        
        /**
         * 
         * @param url
         * @returns
         */
        isDownloaded: function(url) {
            return downloaded[url] !== undefined;
        },
        
        setDownloaded: function(url){
            if (url){
                downloaded[url] = {
                    url: url,
                    success: true,
                    complete: true
                };
            }
        },
        /**
         * 
         * @param includes
         * @param callback
         * @param thisObj
         * @returns
         */
        include: function(includes, callback, thisObj) {
            var transaction = new Transaction(this);
            
            if (this.beforeInclude) {
                this.beforeInclude();
            }

            forEachEntry(includes, function(type, includesForType) {
                transaction.add(type, includesForType);
            });

            return transaction.execute(_createAsyncCallback(callback, thisObj));
        }
    };
});
/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @extension Browser
 */
define.extend('raptor/loader', ['raptor'], function(raptor, require) {
    "use strict";
    
    var resourcesRegistered = false,
        forEach = raptor.forEach;
    
    return {
        
        handle_js: function(include, transaction) {
            var url = include.src || include.url || include;
            transaction._add(url, include, this.includeJSImpl, this);
        },
        
        handle_css: function(include, transaction) {
            var url = include.href || include.url || include;
            transaction._add(url, include, this.includeCSSImpl, this);
        },
        
        /**
         * 
         * @param src
         * @param callback
         * @param thisObj
         * @returns
         */
        includeJS: function(src, callback, thisObj) {
            return this.include({js: [src]}, callback, thisObj);
        },
        
        /**
         * 
         * @param href
         * @param callback
         * @param thisObj
         * @returns
         */
        includeCSS: function(href, callback, thisObj) {
            return this.include({css: [href]}, callback, thisObj);
        },
        
        /**
         * Find out all the script and links tag on the page
         * and register with downloaded object.
         * @returns
         */
        registerResources: function(){
            var scripts = document.getElementsByTagName('script'),
                scriptsLen = scripts.length,
                links = document.getElementsByTagName('link'),
                linksLen = links.length,
                i;

            for (i = 0; i < scriptsLen; i++) {
                this.setDownloaded(scripts[i].src || scripts[i].href);
            }

            for (i = 0; i < linksLen; i++) {
                this.setDownloaded(links[i].src || links[i].href);
            }
        },
        
        /**
         * Before calling include for first time register page resources.
         * It is done only once for the first time "include" is called
         * @returns
         */
        beforeInclude: function(){
            if (!resourcesRegistered){
                this.registerResources();
            }
            
            resourcesRegistered = true;
        }
        
    };
});

/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @extension Raptor
 */
define.extend('raptor/loader', ['raptor'], function(raptor, require) {
    "use strict";
    var logger = require('raptor/logging').logger('raptor/loader'),
        extend = raptor.extend,
        headEl,
        createEl = function(tagName, attributes) {
            var newEl = document.createElement(tagName);
            if (attributes) {
                extend(newEl, attributes);    
            }
            return newEl;
        },
        insertEl = function(el) {
            if (headEl == null)
            {
                headEl = document.getElementsByTagName("head")[0];
            }       
            headEl.appendChild(el);
        };
    
    return {
        /**
         * 
         * @param src
         * @param callback
         * @returns
         * 
         * @protected
         */
        includeJSImpl: function(src, callback, attributes) {

            attributes = attributes || {};
            
            var complete = false;
            
            var success = function() {
                if (complete === false) {                    
                    complete = true;
                    logger.debug('Downloaded "' + src + '"...');
                    callback.success();
                }
            };
            
            var error = function() {
                if (complete === false) {                    
                    complete = true;
                    logger.error('Failed: "' + src);
                    //Let the loader module know that the resource was failed to be included
                    callback.error();
                }
            };
            
            extend(attributes, {
                type: 'text/javascript',
                src: src,
                onreadystatechange: function () {
                    if (el.readyState == 'complete' || el.readyState == 'loaded') {
                        success();
                    }
                },

                onload: success,
                
                onerror: error
            });
            
            var el = createEl(
                    "script", 
                    attributes);
            
            if (el.addEventListener)
            {
                try {
                    el.addEventListener("load", function() {
                        success();
                    });
                }
                catch(e) {}
            }

            insertEl(el);
        },
        
        /**
         * 
         * @param href
         * @param callback
         * @param attributes
         * @returns
         * 
         * @protected
         */
        includeCSSImpl: function(href, callback, attributes) {

            var retries = 20;
            
            var complete = false,
                _this = this;
            
            var el = createEl('link');
            
            var cleanup = function() {
                el.onload = null;
                el.onreadystatechange = null;
                el.onerror = null;
            };
            
            var isLoaded  = function() {
                var sheets = document.styleSheets;
                for (var idx = 0, len = sheets.length; idx < len; idx++) {
                    if (sheets[idx].href === href) {
                        return true;
                    }
                }
                return false;
            };

            var success = function() {
                if (complete === false) {                    
                    complete = true;
                    cleanup();
                    logger.debug('Downloaded: "' + href + '"');
                    //Let the loader module know that the resource has included successfully
                    callback.success();
                }
            };
            
            var pollSuccess = function() {
                if (complete === false) {
                    if (!isLoaded() && (retries--)) {
                        return window.setTimeout(pollSuccess,10);
                    }
                    success();
                }
            };
            
            var error = function() {
                logger.error('Failed: "' + href + '"');
                if (complete === false)
                {                    
                    complete = true; 
                    cleanup();
                    //Let the loader module know that the resource was failed to be included
                    callback.error();
                }
            };
            
            extend(el, {
                type: 'text/css',
                rel: "stylesheet",
                href: href
            });
            
            if (attributes) {
                extend(el, attributes);
            }
            
            if (navigator.appName == 'Microsoft Internet Explorer') {
                el.onload = success;                
                el.onreadystatechange = function() {
                    var readyState = this.readyState;
                    if ("loaded" === readyState || "complete" === readyState) {
                        success();
                    }
                };
            }
            else
            {
                //For non-IE browsers we don't get the "onload" and "onreadystatechange" events...
                pollSuccess();
            }
            
            el.onerror = error;      
            insertEl(el);
        }
    };
});