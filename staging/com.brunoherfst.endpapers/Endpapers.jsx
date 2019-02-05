
/*
  
  Endpapers: A CoverBuilder plug-in

  Create end-papers in InDesign

  https://github.com/CoverBuilder/Endpapers-Plugin

  Bruno Herfst 2018

*/

#targetengine "CoverBuilder"

var Endpapers = {
    version: 1.0
};

//--------------------------
// Load Modules
//--------------------------

/*

    ExtendScript Modules Init
    https://github.com/ExtendScript/extendscript-modules

*/

(function(HOST, SELF) {  
    // The HOST/SELF setup was suggested by Marc Autret
    // https://forums.adobe.com/thread/1111415
    var VERSION = 2.4;

    if(HOST[SELF] && HOST[SELF].version > VERSION) return HOST[SELF];  
    HOST[SELF] = SELF;
    SELF.version = VERSION;  

    //    P R I V A T E
    //---------------------
    var INNER = {};  

    INNER.manage = function (hanger, path, depth, callback, upsert) {
        var err = null;

        for (var i = 0; i < depth; i++) {
            var key = path[i];

            if(hanger != null) {
                "undefined" === typeof hanger[key] && upsert && (hanger[key] = isNaN(path[i + 1]) && {} || []); // If next key is an integer - create an array, else create an object.
                if("undefined" === typeof (hanger = hanger[key])) {
                    break;
                };
            } else {
                err = new TypeError("Cannot read property " + key + " of " + (null === hanger && 'null' || typeof hanger));
                break;
            };
        };
        if(callback) {
            return callback(err, hanger);
        } else {
            return err || hanger;
        };
    };

    INNER.get = function( hanger, path, callback ) {
        var err = null;
        var pathArr = path && path.split(".") || [];
        var result = INNER.manage(hanger, pathArr, pathArr.length, undefined, false);
        if(!result) err = new TypeError("Could not get " + hanger.name + " " + path);
        if(callback) {
            return callback(err, result);
        } else {
            return err || result;
        };
    };

    INNER.set = function ( hanger, path, value, callback ) {
        var pathArr = path && path.split(".") || [];
        var depth = pathArr.length - 1;
        var lastKey = pathArr[depth];
        var upsert = true;
        var result = callback || INNER.manage(hanger, pathArr, depth, callback, upsert);
        var setter = function (obj, key, val) {
                return null != obj && key ? obj[key] = val :
                    new TypeError("Cannot set property " + key + " of " + (null === obj && 'null' || typeof obj));
            };

        if(callback) {
            INNER.manage(hanger, pathArr, depth, function (err, obj) {
                err || (result = setter(obj, lastKey, value)) instanceof Error && (err = String(result));
                callback(err, !err && hanger);
            }, upsert);
        } else {
            if(result instanceof Error || (result = setter(result, lastKey, value)) instanceof Error) {
                throw result;
            }
        };

        return SELF;
    };
    
    INNER.initQueue = function () {
        var IQ = this;
        IQ.queue = [];

        IQ.add = function ( initFun ) {
            if(typeof initFun === 'function') {
                IQ.queue.push( initFun );
            } else {
                throw new Error("Only callable items like functions are allowed into the Init Queue. Ignored the request for " + typeof initFun );
            };
        };

        IQ.run = function(){
            for (var i = 0, len = IQ.queue.length; i < len; i++) {
                IQ.queue[i]();
            };
        };
    };

    //    P U B L I C 
    //---------------------

    SELF.patch  = { name: "patch"   };
    SELF.module = { name: "module"  };
    SELF.util   = { name: "utility" };

    SELF.IQ = new INNER.initQueue;
    SELF.init = function() {
        SELF.IQ.run();
    };

    SELF.unload = function() {  
        var k;  
        for( k in INNER ) {  
            if( !(INNER.hasOwnProperty(k)) ) continue;  
            INNER[k]=null;  
            delete INNER[k];  
        };
        for( k in SELF ) {  
            if( !(SELF.hasOwnProperty(k)) ) continue;  
            SELF[k]=null;  
            delete SELF[k];  
        }  
        INNER = SELF = null;  
    };

    SELF.getPatch = function( path, callback ) {
        return INNER.get(SELF.patch, path, callback);
    };

    SELF.getModule = function( path, callback ) {
        return INNER.get(SELF.module, path, callback);
    };

    SELF.getUtil = function( path, callback ) {
        return INNER.get(SELF.util, path, callback);
    };

    SELF.setPatch = function( path, value, callback ) {
        return INNER.set(SELF.patch, path, value, callback);
    };

    SELF.setModule = function( path, value, callback ) {
        return INNER.set(SELF.module, path, value, callback);
    };

    SELF.setUtil = function( path, value, callback ) {
        return INNER.set(SELF.util, path, value, callback);
    };

    SELF.throwCallback = function( fileName, line ) {
        // Sky.throwCallback($.fileName, $.line)
        // Throw an error when dependency could not be loaded...
        return function ( err, module ) {
            if( err instanceof Error || err instanceof TypeError ) {
                throw new TypeError( err.message, fileName, line );
            };
            return module;
        };
    };

})($.global,{toString:function(){return 'Sky';}});


// ExtendScript Polyfill Array bundle
// https://github.com/ExtendScript/extendscript-modules

/*
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every
*/
if (!Array.prototype.every) {
  Array.prototype.every = function(callback, thisArg) {
    var T, k;

    if (this === void 0 || this === null) {
      throw new TypeError('Array.prototype.every called on null or undefined');
    }

    // 1. Let O be the result of calling ToObject passing the this 
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method
    //    of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    if (callback.__class__ !== 'Function') {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    T = (arguments.length > 1) ? thisArg : void 0;

    // 6. Let k be 0.
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal 
      //    method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal method
        //    of O with argument Pk.
        kValue = O[k];

        // ii. Let testResult be the result of calling the Call internal method
        //     of callback with T as the this value and argument list 
        //     containing kValue, k, and O.
        var testResult = callback.call(T, kValue, k, O);

        // iii. If ToBoolean(testResult) is false, return false.
        if (!testResult) {
          return false;
        }
      }
      k++;
    }
    return true;
  };
}
/*
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
*/
if (!Array.prototype.filter) {
  Array.prototype.filter = function(callback, thisArg) {

    if (this === void 0 || this === null) {
      throw new TypeError('Array.prototype.filter called on null or undefined');
    }

    var t = Object(this);
    var len = t.length >>> 0;

    if (callback.__class__ !== 'Function') {
      throw new TypeError(callback + ' is not a function');
    }

    var res = [];

    var T = (arguments.length > 1) ? thisArg : void 0;
    
    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];

        // NOTE: Technically this should Object.defineProperty at
        //       the next index, as push can be affected by
        //       properties on Object.prototype and Array.prototype.
        //       But that method's new, and collisions should be
        //       rare, so use the more-compatible alternative.
        if (callback.call(T, val, i, t)) {
          res.push(val);
        }
      }
    }

    return res;
  };
}
/*
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
*/
// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    };
};

/*
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
*/
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, thisArg) {


        if (this === void 0 || this === null) {
            throw new TypeError('Array.prototype.forEach called on null or undefined');
        }

        // 1. Let O be the result of calling toObject() passing the
        // |this| value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get() internal
        // method of O with the argument "length".
        // 3. Let len be toUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If isCallable(callback) is false, throw a TypeError exception. 
        // See: http://es5.github.com/#x9.11
        if (callback.__class__ !== 'Function') {
            throw new TypeError(callback + ' is not a function');
        }

        // 5. If thisArg was supplied, let T be thisArg; else let
        // T be undefined.
        var T = (arguments.length > 1) ? thisArg : void 0;


        // 6. Let k be 0
        //k = 0;

        // 7. Repeat, while k < len
        for (var k = 0; k < len; k++) {
            var kValue;
            // a. Let Pk be ToString(k).
            //    This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty
            //    internal method of O with argument Pk.
            //    This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {
                // i. Let kValue be the result of calling the Get internal
                // method of O with argument Pk.
                kValue = O[k];
                // ii. Call the Call internal method of callback with T as
                // the this value and argument list containing kValue, k, and O.
                callback.call(T, kValue, k, O);
            }
        }
        // 8. return undefined
    }
}
// Production steps of ECMA-262, Edition 6, 22.1.2.1
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike/*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined');
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method 
      // of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }());
}

/*
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Polyfill
*/
// Production steps of ECMA-262, Edition 5, 15.4.4.14
// Reference: http://es5.github.io/#x15.4.4.14
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(searchElement, fromIndex) {


    // 1. Let o be the result of calling ToObject passing
    //    the this value as the argument.
    if (this === void 0 || this === null) {
      throw new TypeError('Array.prototype.indexOf called on null or undefined');
    }

    var k;
    var o = Object(this);

    // 2. Let lenValue be the result of calling the Get
    //    internal method of o with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = o.length >>> 0;

    // 4. If len is 0, return -1.
    if (len === 0) {
      return -1;
    }

    // 5. If argument fromIndex was passed let n be
    //    ToInteger(fromIndex); else let n be 0.
    var n = +fromIndex || 0;

    if (Math.abs(n) === Infinity) {
      n = 0;
    }

    // 6. If n >= len, return -1.
    if (n >= len) {
      return -1;
    }

    // 7. If n >= 0, then Let k be n.
    // 8. Else, n<0, Let k be len - abs(n).
    //    If k is less than 0, then let k be 0.
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    // 9. Repeat, while k < len
    while (k < len) {
      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the
      //    HasProperty internal method of o with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      //    i.  Let elementK be the result of calling the Get
      //        internal method of o with the argument ToString(k).
      //   ii.  Let same be the result of applying the
      //        Strict Equality Comparison Algorithm to
      //        searchElement and elementK.
      //  iii.  If same is true, return k.
      if (k in o && o[k] === searchElement) {
        return k;
      }
      k++;
    }
    return -1;
  };
}
/*
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
*/
if (!Array.isArray) {
  Array.isArray = function(arg) {
    if (arg === void 0 || arg === null) {
      return false;
    };
      return (arg.__class__ === 'Array');
  };
};

/*
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf
*/
// Production steps of ECMA-262, Edition 5, 15.4.4.15
// Reference: http://es5.github.io/#x15.4.4.15
if (!Array.prototype.lastIndexOf) {
  Array.prototype.lastIndexOf = function(searchElement, fromIndex) {

    if (this === void 0 || this === null) {
      throw new TypeError('Array.prototype.lastIndexOf called on null or undefined');
    }

    var n, k,
      t = Object(this),
      len = t.length >>> 0;
    if (len === 0) {
      return -1;
    }

    n = len - 1;
    if (arguments.length > 1) {
      n = Number(arguments[1]);
      if (n != n) {
        n = 0;
      }
      else if (n != 0 && n != Infinity && n != -Infinity) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }

    for (k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n); k >= 0; k--) {
      if (k in t && t[k] === searchElement) {
        return k;
      }
    }
    return -1;
  };
}
/*
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
*/
// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {

  Array.prototype.map = function(callback, thisArg) {

    var T, A, k;

    if (this === void 0 || this === null) {
      throw new TypeError('Array.prototype.map called on null or undefined');
    }

    // 1. Let O be the result of calling ToObject passing the |this| 
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal 
    //    method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (callback.__class__ !== 'Function') {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    T = (arguments.length > 1) ? thisArg : void 0;

    // 6. Let A be a new array created as if by the expression new Array(len) 
    //    where Array is the standard built-in constructor with that name and 
    //    len is the value of len.
    A = new Array(len);

    for (var k = 0; k < len; k++) {

      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal 
      //    method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal 
        //    method of O with argument Pk.
        kValue = O[k];

        // ii. Let mappedValue be the result of calling the Call internal 
        //     method of callback with T as the this value and argument 
        //     list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor
        // { Value: mappedValue,
        //   Writable: true,
        //   Enumerable: true,
        //   Configurable: true },
        // and false.

        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, k, {
        //   value: mappedValue,
        //   writable: true,
        //   enumerable: true,
        //   configurable: true
        // });

        // For best browser support, use the following:
        A[k] = mappedValue;
      }
    }
    // 9. return A
    return A;
  };
}
/*
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
*/
// Production steps of ECMA-262, Edition 5, 15.4.4.21
// Reference: http://es5.github.io/#x15.4.4.21
if (!Array.prototype.reduce) {
  Array.prototype.reduce = function(callback, initialValue) {

    if (this === void 0 || this === null) {
      throw new TypeError('Array.prototype.reduce called on null or undefined');
    }

    if (callback.__class__ !== 'Function') {
      throw new TypeError(callback + ' is not a function');
    }

    var t = Object(this), len = t.length >>> 0, k = 0, value;

    if (arguments.length > 1) 
      {
        value = initialValue;
      } 
    else 
      {
        while (k < len && !(k in t)) {
          k++; 
        }
        if (k >= len) {
          throw new TypeError('Reduce of empty array with no initial value');
        }
        value = t[k++];
      }

    for (; k < len; k++) {
      if (k in t) {
        value = callback(value, t[k], k, t);
      }
    }
    return value;
  };
}
/*
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/ReduceRight
*/
// Production steps of ECMA-262, Edition 5, 15.4.4.22
// Reference: http://es5.github.io/#x15.4.4.22
if (!Array.prototype.reduceRight) {
  Array.prototype.reduceRight = function(callback, initialValue) {

    if (this === void 0 || this === null) {
      throw new TypeError('Array.prototype.reduceRight called on null or undefined');
    }

    if (callback.__class__ !== 'Function') {
      throw new TypeError(callback + ' is not a function');
    }

    var t = Object(this), len = t.length >>> 0, k = len - 1, value;
    if (arguments.length > 1) 
      {
        value = initialValue;
      } 
    else 
      {
        while (k >= 0 && !(k in t)) {
          k--;
        }
        if (k < 0) {
          throw new TypeError('Reduce of empty array with no initial value');
        }
        value = t[k--];
      }
      
    for (; k >= 0; k--) {
      if (k in t) {
        value = callback(value, t[k], k, t);
      }
    }
    return value;
  };
}
/*
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
*/
// Production steps of ECMA-262, Edition 5, 15.4.4.17
// Reference: http://es5.github.io/#x15.4.4.17
if (!Array.prototype.some) {
  Array.prototype.some = function(callback, thisArg) {

    if (this === void 0 || this === null) {
      throw new TypeError('Array.prototype.some called on null or undefined');
    }

    if (callback.__class__ !== 'Function') {
      throw new TypeError(callback + ' is not a function');
    }

    var t = Object(this);
    var len = t.length >>> 0;

    var T = arguments.length > 1 ? thisArg : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t && callback.call(T, t[i], i, t)) {
        return true;
      }
    }

    return false;
  };
}


(function () {
    var VERSION = 0.4;
    var MODULE_PATH = "menuloader";
    
    // This module is inspired by posts from Marc Autret (Indiscripts)
    // http://www.indiscripts.com/post/2010/02/how-to-create-your-own-indesign-menus
    // http://www.indiscripts.com/post/2011/12/indesign-scripting-forum-roundup-2

    // ---
    // Note:  menus/submenus are application-persistent

    var thisModule = Sky.getUtil(MODULE_PATH);
    if( thisModule && thisModule.version >= VERSION) {
        return;
    };

    //--------------------------
    // Start menuloader class

    function moduleClass() {
        var menuloader = this;

        menuloader.version = VERSION;
        menuloader.description = "Load an InDesign menu item.";

        menuloader.funWrapper = function( fun, menuName ) {
            // Wrap the given function in a try-catch statement and add single undo for user action.
            // So we don't halt the whole application on error and user can undo any manu action.
            return function () {
                try {
                    // prevent undo - CS5+
                    app.doScript(fun, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "Expand State Abbreviations");
                } catch(e) {
                    alert(menuName + " generated an error:\n" + e.message +  " (Line " + e.line + " in file " + e.fileName + ")");
                };
            };
        };

        menuloader.getMenu = function( MenuTemplate ) {
            var location = app.menus.item( '$ID/Main' );
            for (var i = 0; i < MenuTemplate.path.length; i++) {
                location = location.submenus.item( MenuTemplate.path[i] );
            };

            if(!location.isValid){
                return new Error( "InDesign main menu $ID/Main does not resolve into object.");
            };

            return location.menuElements.itemByName( MenuTemplate.menuName );
        };

        menuloader.unloadElement = function( Element ) {
            if(!Element.isValid){
                return new Error( "Element does not resolve to object." );
            };

            try {
                if(Element.hasOwnProperty('menuElements')) {
                    // Clean subitems recursively
                    var subCount = Element.menuElements.count();
                    for (var i = subCount - 1; i >= 0; i--) {
                        var subElement = Element.menuElements[i];
                        if( subElement.menuElements.count() > 0 ) {
                            menuloader.unloadElement( subElement );
                        };
                    };
                };
            } catch(e) { };

            Element.remove();
        };

        menuloader.load = function( MenuTemplate, alertUser ) {
            // Make sure old menu is removed before building a new one
            menuloader.unload( MenuTemplate, alertUser );

            // Enable ExtendScript localisation engine
            $.localize = true;
            var AT_END = LocationOptions.atEnd;
            var alertUser = (typeof alertUser === 'boolean')? alertUser : true;

            try{
                var MainMenu = app.menus.item( '$ID/Main' );

                var menuInstaller = menuInstaller || ( function() {
                    
                    var location = MainMenu;
                    for (var i = 0; i < MenuTemplate.path.length; i++) {
                        location = location.submenus.item( MenuTemplate.path[i] );
                    };

                    var refItem = location.submenus.lastItem();
                    if( MenuTemplate.ref ) {
                        refItem = location.menuItems.item( MenuTemplate.ref );
                    };

                    var loc = LocationOptions.after;
                    if( MenuTemplate.loc ) {
                        loc = MenuTemplate.loc;
                    };

                    if(location === MainMenu) {
                        location = location.submenus.add( MenuTemplate.menuName, LocationOptions.before, location.submenus.lastItem() );
                    };

                    // Load Menu
                    if(MenuTemplate.sub.length === 0) {

                        // There is no sub menu, load default action
                        var fun = menuloader.funWrapper( MenuTemplate.fun, MenuTemplate.menuName );
                        MenuTemplate.action = app.scriptMenuActions.add( MenuTemplate.menuName );
                        MenuTemplate.action.addEventListener('onInvoke', fun);
                        location.menuItems.add( MenuTemplate.action, loc, refItem );

                    } else { // Load with Sub Menu!
                        
                        location = location.submenus.add( MenuTemplate.menuName, loc, refItem );

                        // (Re)set the menu actions
                        // ---
                        var subItem, i = MenuTemplate.sub.length;
                        while( i-- ) {
                            subItem = MenuTemplate.sub[i];
                            if( subItem.separator ) continue;

                            if( typeof subItem.fun === 'function') {
                                // Create the corresponding action
                                // ---
                                var fun = menuloader.funWrapper( subItem.fun, MenuTemplate.menuName + " - " + subItem.caption );
                                subItem.action = app.scriptMenuActions.add( subItem.caption );
                                subItem.action.addEventListener('onInvoke', fun);
                            };
                        };

                        // Build Sub Menu
                        // ---
                        // Fill menu with respect to MenuTemplate order
                        // (Possible submenus are specified in .subName and created on the fly)
                        // ---
                        var s, n = MenuTemplate.sub.length, subs = {}, sub = null;
                        for( i=0 ; i < n ; ++i ) {
                            subItem = MenuTemplate.sub[i];

                            // Target the desired submenu
                            // ---
                            sub = (s=subItem.subName) ? ( subs[s] || (subs[s]=location.submenus.add( s, AT_END )) ) : location;

                            // Connect the related action OR create a separator
                            // ---
                            if( subItem.separator ) {
                                sub.menuSeparators.add( AT_END );
                            } else {
                                sub.menuItems.add( subItem.action, AT_END );
                            };
                        };
                        // End Build Sub Menu

                    }; // End Load Menu

                    return true;

                })(); // invoke!!
            } catch ( err ) {
                if(alertUser) alert("Unable to load menu " + "\n" + err.message + " (Line " + err.line + " in file " + err.fileName + ")")
                return err;
            };
        };

        menuloader.unload = function( MenuTemplate, alertUser ) {
            // Enable ExtendScript localisation engine
            $.localize = true;
            var alertUser = (typeof alertUser === 'boolean')? alertUser : true;
            
            var MainMenu = app.menus.item( '$ID/Main' );
            if(!MainMenu.isValid){
                return new Error("InDesign main menu $ID/Main does not resolve into object.");
            };

            var Submenu = MainMenu;
            try{
                for (var i = 0; i < MenuTemplate.path.length; i++) {
                    Submenu = Submenu.submenus.item( MenuTemplate.path[i] );
                };
            } catch ( err ) {
                if(alertUser) alert("Unable to unload menu " + String(MenuTemplate.menuName) + "\n" + err.message + " (Line " + err.line + " in file " + err.fileName + ")");
                return err;
            };

            if(Submenu.isValid) {
                menuloader.unloadElement(
                    Submenu.menuElements.itemByName(MenuTemplate.menuName)
                );
            } else {
                if(alertUser) alert("Unable to unload menu " + String(MenuTemplate.menuName) + "\n" + err.message + " (Line " + err.line + " in file " + err.fileName + ")");
                return new Error("Menu location does not seem to resolve to a valid menu option.");
            };
        };

        menuloader.template = function( menuName, Options ) {
            if (!(this instanceof menuloader.template)) {
                throw new Error("menuTemplate should be created using new operator.");
            };

            var Menu = this;
            var Options = (typeof Options === 'object') ? Options : {};

            Menu.menuName = String( menuName );

            // Array, Empty === Main
            Menu.path = (Options.hasOwnProperty('path')) ? [].concat(Options.path) : [];
            Menu.sub  = (Options.hasOwnProperty('sub' )) ? [].concat(Options.sub)  : [];
            Menu.ref  = (Options.hasOwnProperty('ref' )) ? Options.ref  : undefined;
            Menu.loc  = (Options.hasOwnProperty('loc' )) ? Options.loc  : undefined;
            Menu.fun  = (Options.hasOwnProperty('fun' )) ? Options.fun  : undefined;

            // Menu Tools
            //- - - - - -
            Menu.addElement = function( elementTemplate ) {
                Menu.sub.push( elementTemplate );
                return Menu;
            };

            // Element Templates
            //- - - - - - - - - -
            Menu.createItem = function( caption, fun, subName ) {
                // subName is optional
                var subName = (typeof subName === 'string')? subName : "";
                return { caption: String(caption), fun: fun,  subName: String(subName) };
            };

            Menu.createSeparator = function( subName ) {
                // subName is optional
                var subName = (typeof subName === 'string')? subName : "";
                return { separator: true, subName: subName };
            };

            Menu.load = function( alertUser ) {
                menuloader.load( Menu, alertUser );
                return Menu;
            };

            Menu.unload = function( alertUser ) {
                menuloader.unload( Menu, alertUser );
                return Menu;
            };

            Menu.getLoaded = function(){
                return menuloader.getMenu(Menu);
            };

            Menu.isLoaded = function(){
                var loadedMenu = menuloader.getMenu(Menu);
                if( loadedMenu.isValid ) {
                    return true;
                };
                return false;
            };

        };

    };

    //--------------------------
    // End menuloader class

    Sky.setUtil(MODULE_PATH, new moduleClass() );

})();

(function () {
    var VERSION = 2.0;
    var MODULE_PATH = "rulers";

    var rulers = Sky.getUtil(MODULE_PATH);
    if( rulers && rulers.version >= VERSION) {
      return;
    };

    //--------------------------
    // start rulers object

    function Rulers() {
        var Rulers = this;

        Rulers.version = VERSION;
        Rulers.description = "InDesign Ruler Tools for getting, setting and converting MeasurementUnits";
        
        Rulers._ppi = 300;
        
        Rulers.setPPI = function ( num ) {
          Rulers._ppi = parseInt( num );
          return Rulers;
        };

        Rulers.getPPI = function() {
          return Rulers._ppi;
        };

        Rulers._setX = function( Doc, indUnits ) {
            if( indUnits ) { // check for undefined (return from indUnitsFrom)
                try {
                    Doc.viewPreferences.horizontalMeasurementUnits = indUnits;
                } catch( err ) {
                    return err;
                };
            };
        };

        Rulers._setY = function( Doc, indUnits ) {
            if( indUnits ) { // check for undefined (return from indUnitsFrom)
                try {
                    Doc.viewPreferences.verticalMeasurementUnits = indUnits;
                } catch( err ) {
                    return err;
                };
            };
        };

        Rulers._set = function( Doc, indUnits ) {
            Rulers._setX( Doc, indUnits );
            Rulers._setY( Doc, indUnits );
        };

        // MEASUREMENT CONVERSION
        //-----------------------

        // Let's use points as an internal conversion step
        // this is the same as InDesign custom

        //  T O / F R O M   P O I N T S
        //  - - - - - - - - - - - - - -

        Rulers.mm2pt = function( num ) {
            // 1 millimeter = 2.8346456692913384 PostScript points
            return num * 2.8346456692913384;
        };

        Rulers.inch2pt = function( num ) {
            //1 inch = 72 postscript points
            return num * 72;
        };

        Rulers.ap2pt = function( num ) {
            // 1 American Point = 0.9962640099626 points
            return num * 0.9962640099626;
        };

        Rulers.ag2pt = function( num ) {
            // 1 Agate = 5.142857143 points
            return num * 5.142857143;
        };

        Rulers.bai2pt = function( num ) {
            // Bai means `100` and I believe this is 1 millimeter
            return Rulers.mm2pt( num );
        };

        Rulers.cm2pt = function( num ) {
            // 1 cm = 28.346456692913385 points
            return num * 28.346456692913385;
        };

        Rulers.c2pt = function( num ) {
            // 1 ciceros = 12.78895216411 points
            return num * 12.78895216411;
        };

        Rulers.cstm2pt = function( num ) {
            // Custom values are entered in points
            return num;
        };

        Rulers.h2pt = function( num ) {
            // 1 Q = 1 Ha = 0.25 millimeter
            return Rulers.mm2pt( num * 0.25 );
        };

        Rulers.mil2pt = function( num ) {
            // Thousands of an inch
            // 1 inch = 1000 mils, thou
            // 1 mil = 0.072 points
            return num * 0.072;
        };

        Rulers.p2pt = function( num ) {
            // 1 pica = 12 points
            return num * 12;
        };

        Rulers.px2pt = function( num, ppi ) {
            var ppi = (typeof ppi === 'number') ? ppi : Rulers._ppi;
            return Rulers.inch2pt( num / ppi );
        };

        Rulers.q2pt = function( num ) {
            // 1 Q = 1 Ha = 0.25 millimeter
            return Rulers.mm2pt( num * 0.25 );
        };

        Rulers.u2pt = function( num ) {
            // I assume that U is a micrometer/Microns(µ)
            // 1 micrometer = 0.002834645669291339 points
            return num * 0.002834645669291339;
        };

        Rulers.pt2mm = function( num ) {
            // 1 millimeter = 2.8346456692913384 PostScript points
            return num / 2.8346456692913384;
        };

        Rulers.pt2inch = function( num ) {
            //1 inch = 72 postscript points
            return num / 72;
        };

        Rulers.pt2ap = function( num ) {
            // 1 American Point = 0.9962640099626 points
            return num / 0.9962640099626;
        };

        Rulers.pt2ag = function( num ) {
            // 1 Agate = 5.142857143 points
            return num / 5.142857143;
        };

        Rulers.pt2bai = function( num ) {
            // Bai means `100` I believe this is 1 millimeter
            return Rulers.pt2mm( num );
        };

        Rulers.pt2cm = function( num ) {
            // 1 cm = 28.346456692913385 points
            return num / 28.346456692913385;
        };

        Rulers.pt2c = function( num ) {
            // 1 ciceros = 12.78895216411 points
            return num / 12.78895216411;
        };

        Rulers.pt2cstm = function( num ) {
            // Custom values are entered in points
            return num;
        };

        Rulers.pt2h = function( num ) {
            // 1 Q = 1 Ha = 0.25 millimeter
            return Rulers.pt2mm( num / 0.25 );
        };

        Rulers.pt2mil = function( num ) {
            // Thousands of an inch
            // 1 inch = 1000 mils, thou
            // 1 mil = 0.072 points
            return num / 0.072;
        };

        Rulers.pt2p = function( num ) {
            // 1 pica = 12 points
            return num / 12;
        };

        Rulers.pt2px = function( num, ppi ) {
            var ppi = (typeof ppi === 'number') ? ppi : Rulers._ppi;
            var rounded = Math.round( ( num / 72 ) * ppi );
            return ( rounded > 0 ) ? rounded : 1;
        };

        Rulers.pt2q = function( num ) {
            // 1 Q = 1 Ha = 0.25 millimeter
            return Rulers.pt2mm( num / 0.25 );
        };

        Rulers.pt2u = function( num ) {
            // I assume that U is a micrometer
            // 1 micrometer = 0.002834645669291339 points
            return num / 0.002834645669291339;
        };

        //  M E A S U R E  2  P O I N T S
        //  - - - - - - - - - - - - - - -

        Rulers.measure2pt = function( num, mUnit, roundDec, failCallBack ){
            // Shift args, if no callback is defined return null
            if( typeof failCallBack !== 'function') {
                if( typeof roundDec === 'function' ) {
                    var failCallBack = roundDec, roundDec = undefined;
                } else {
                    var failCallBack = function( err ) {
                        return null;
                    };
                };
            };

            var measure = null;
            var indUnits = Rulers.indUnitsFrom( mUnit );
            var roundDec = (typeof roundDec === "number") ? parseInt(roundDec) : 0;

            switch( indUnits ) {
                case 2053991795: // MeasurementUnits.MILLIMETERS
                    measure = Rulers.mm2pt( num );
                    break;
                case 2053729892: // MeasurementUnits.INCHES_DECIMAL
                    measure = Rulers.inch2pt( num );
                    break;
                case 2053729891: // MeasurementUnits.INCHES
                    measure = Rulers.inch2pt( num );
                    break;
                case 2054188905: // MeasurementUnits.POINTS
                    measure = num;
                    break;
                case 1514238068: // MeasurementUnits.AMERICAN_POINTS
                    measure = Rulers.ap2pt( num );
                    break;
                case 2051106676: // MeasurementUnits.AGATES
                    measure = Rulers.ag2pt( num );
                    break;
                case 2051170665: // MeasurementUnits.BAI
                    measure = Rulers.bai2pt( num );
                    break;
                case 2053336435: // MeasurementUnits.CENTIMETERS
                    measure = Rulers.cm2pt( num );
                    break;
                case 2053335395: // MeasurementUnits.CICEROS
                    measure = Rulers.c2pt( num );
                    break;
                case 1131639917: // MeasurementUnits.CUSTOM
                    measure = Rulers.cstm2pt( num );
                    break;
                case 1516790048: // MeasurementUnits.HA
                    measure = Rulers.h2pt( num );
                    break;
                case 2051893612: // MeasurementUnits.MILS
                    measure = Rulers.mil2pt( num );
                    break;
                case 2054187363: // MeasurementUnits.PICAS
                    measure = Rulers.p2pt( num );
                    break;
                case 2054187384: // MeasurementUnits.PIXELS
                    measure = Rulers.px2pt( num );
                    break;
                case 2054255973: // MeasurementUnits.Q
                    measure = Rulers.q2pt( num );
                    break;
                case 2051691808: // MeasurementUnits.U
                    measure = Rulers.u2pt( num );
                    break;
                default:
                    return failCallBack( new Error("Could not parse MeasurementUnits: " + typeof(measureUnit) + " " + stringUnits) );
                    measure = null;
                    break;
            };

            if( typeof(measure) !== 'number' ) {
                return measure;
            };

            if(roundDec > 0) {
              return Rulers.roundNum(measure, roundDec);
            } else {
              return measure; 
            };
        };

        // C O N V E R T  V I A  P O I N T S
        // - - - - - - - - - - - - - - - - -

        Rulers._resolveConvert = function ( toUnit, convertFromPoints, num, fromUnit, roundDec, failCallBack ) {
            // Shift arguments, if no callback is defined return null
            if( typeof failCallBack !== 'function') {
                if( typeof roundDec === 'function' ) {
                    var failCallBack = roundDec, roundDec = undefined;
                } else {
                    var failCallBack = function( err ) {
                        return null;
                    };
                };
            };

            var fromIndUnits = Rulers.indUnitsFrom( fromUnit );
            var toIndUnits   = Rulers.indUnitsFrom( toUnit   );
            var roundDec = (typeof roundDec === "number") ? parseInt(roundDec) : 0;

            // If already in the same units
            if( fromIndUnits === toIndUnits ) {
                if(roundDec > 0) {
                    return Rulers.roundNum(num, roundDec);
                } else {
                    return num; 
                };
            };

            var pointMeasure = Rulers.measure2pt( num, fromIndUnits);
            if( typeof(pointMeasure) !== 'number' ) {
                return pointMeasure;
            };

            var measure = convertFromPoints( pointMeasure );

            if(roundDec > 0) {
              return Rulers.roundNum(measure, roundDec);
            } else {
              return measure; 
            };
        };

        Rulers.measure2mm = function( num, mUnit, roundDec, failCallBack ){
            return Rulers._resolveConvert("mm", Rulers.pt2mm, num, mUnit, roundDec, failCallBack );
        };

        Rulers.measure2inch = function( num, mUnit, roundDec, failCallBack ){
            return Rulers._resolveConvert("inch", Rulers.pt2inch, num, mUnit, roundDec, failCallBack );
        };

        Rulers.measure2ap = function( num, mUnit, roundDec, failCallBack ){
            return Rulers._resolveConvert("ap", Rulers.pt2ap, num, mUnit, roundDec, failCallBack );
        };

        Rulers.measure2ag = function( num, mUnit, roundDec, failCallBack ){
            return Rulers._resolveConvert("ag", Rulers.pt2ag, num, mUnit, roundDec, failCallBack );
        };

        Rulers.measure2bai = function( num, mUnit, roundDec, failCallBack ){
            return Rulers._resolveConvert("bai", Rulers.pt2bai, num, mUnit, roundDec, failCallBack );
        };

        Rulers.measure2cm = function( num, mUnit, roundDec, failCallBack ){
            return Rulers._resolveConvert("cm", Rulers.pt2cm, num, mUnit, roundDec, failCallBack );
        };

        Rulers.measure2c = function( num, mUnit, roundDec, failCallBack ){
            return Rulers._resolveConvert("c", Rulers.pt2c, num, mUnit, roundDec, failCallBack );
        };

        Rulers.measure2h = function( num, mUnit, roundDec, failCallBack ){
            return Rulers._resolveConvert("h", Rulers.pt2h, num, mUnit, roundDec, failCallBack );
        };

        Rulers.measure2mil = function( num, mUnit, roundDec, failCallBack ){
            return Rulers._resolveConvert("mil", Rulers.pt2mil, num, mUnit, roundDec, failCallBack );
        };

        Rulers.measure2p = function( num, mUnit, roundDec, failCallBack ){
            return Rulers._resolveConvert("p", Rulers.pt2p, num, mUnit, roundDec, failCallBack );
        };

        Rulers.measure2px = function( num, mUnit, roundDec, failCallBack ){
            return Rulers._resolveConvert("px", Rulers.pt2px, num, mUnit, roundDec, failCallBack );
        };

        Rulers.measure2q = function( num, mUnit, roundDec, failCallBack ){
            return Rulers._resolveConvert("q", Rulers.pt2q, num, mUnit, roundDec, failCallBack );
        };

        Rulers.measure2u = function( num, mUnit, roundDec, failCallBack ){
        	return Rulers._resolveConvert("u", Rulers.pt2u, num, mUnit, roundDec, failCallBack );
        };

        // C O N V E R T 
        // - - - - - - - 

        Rulers.convert = function( num, fromUnit, toUnit, roundDec, failCallBack ) {
            var fromIndUnits = Rulers.indUnitsFrom( fromUnit );
            var toIndUnits   = Rulers.indUnitsFrom( toUnit   );
            
            // Shift args, if no callback is defined return null
            if( typeof failCallBack !== 'function') {
                if( typeof roundDec === 'function' ) {
                    var failCallBack = roundDec, roundDec = undefined;
                } else {
                    var failCallBack = function( err ) {
                        return null;
                    };
                };
            };
            
            if( fromIndUnits === null ) {
                return failCallBack( new Error("Could not parse fromUnit: " + typeof(fromUnit) + " " + String(fromUnit) ));
            };
            
            if( toIndUnits === null ) {
                return failCallBack( new Error("Could not parse toUnit: " + typeof(fromUnit) + " " + String(fromUnit) ));
            };

            switch( toIndUnits ) {
                case 2053991795: // MeasurementUnits.MILLIMETERS
                    return Rulers.measure2mm( num, fromIndUnits, roundDec, failCallBack );
                    break;
                case 2053729892: // MeasurementUnits.INCHES_DECIMAL
                    return Rulers.measure2inch( num, fromIndUnits, roundDec, failCallBack );
                    break;
                case 2053729891: // MeasurementUnits.INCHES
                    return Rulers.measure2inch( num, fromIndUnits, roundDec, failCallBack );
                    break;
                case 2054188905: // MeasurementUnits.POINTS
                    return Rulers.measure2pt( num, fromIndUnits, roundDec, failCallBack );
                    break;
                case 1514238068: // MeasurementUnits.AMERICAN_POINTS
                    return Rulers.measure2ap( num, fromIndUnits, roundDec, failCallBack );
                    break;
                case 2051106676: // MeasurementUnits.AGATES
                    return Rulers.measure2ag( num, fromIndUnits, roundDec, failCallBack );
                    break;
                case 2051170665: // MeasurementUnits.BAI
                    return Rulers.measure2bai( num, fromIndUnits, roundDec, failCallBack );
                    break;
                case 2053336435: // MeasurementUnits.CENTIMETERS
                    return Rulers.measure2cm( num, fromIndUnits, roundDec, failCallBack );
                    break;
                case 2053335395: // MeasurementUnits.CICEROS
                    return Rulers.measure2c( num, fromIndUnits, roundDec, failCallBack );
                    break;
                case 1131639917: // MeasurementUnits.CUSTOM
                    return Rulers.measure2pt( num, fromIndUnits, roundDec, failCallBack );
                    break;
                case 1516790048: // MeasurementUnits.HA
                    return Rulers.measure2h( num, fromIndUnits, roundDec, failCallBack );
                    break;
                case 2051893612: // MeasurementUnits.MILS
                    return Rulers.measure2mil( num, fromIndUnits, roundDec, failCallBack );
                    break;
                case 2054187363: // MeasurementUnits.PICAS
                    return Rulers.measure2p( num, fromIndUnits, roundDec, failCallBack );
                    break;
                case 2054187384: // MeasurementUnits.PIXELS
                    return Rulers.measure2px( num, fromIndUnits, roundDec, failCallBack );
                    break;
                case 2054255973: // MeasurementUnits.Q
                    return Rulers.measure2q( num, fromIndUnits, roundDec, failCallBack );
                    break;
                case 2051691808: // MeasurementUnits.U
                    return Rulers.measure2u( num, fromIndUnits, roundDec, failCallBack );
                    break;
                default:
                    return failCallBack( new Error("Could not parse MeasurementUnits: " + typeof(measureUnit) + " " + stringUnits) );
                    break;
            };
        };

        Rulers.NaN20 = function( num ){
            if(isNaN(num)){
                return 0;
            } else {
                return num;
            };
        };

        Rulers.roundNum = function ( num, roundDec ){
            if( typeof num !== 'number') {
                return NaN;
            };
            var roundMulit = Math.pow( 10, parseInt(roundDec) );
            return Math.round(num*roundMulit)/roundMulit;
        };

        Rulers.constrainNum = function( number, min, max, clippedCallBack){
            var clipped = Math.max(Math.min( number, max), min);
            if( (typeof clippedCallBack === 'function') && (clipped != number) ){
                clippedCallBack();
            };
            return clipped;
        };

        Rulers.numToGridStep = function( num, gridStep, roundDec ){
            var result = Math.round(num/gridStep)*gridStep;
            if( typeof roundDec === 'number' ) {
                return Rulers.roundNum(result, roundDec);
            } else {
                return result;
            };
        };

        // This function returns InDesign MeasurementUnits or null if not valid
        Rulers.indUnitsFrom = function( measureUnit, failCallBack ) {

            // TODO: Add international string values (translations)
            // - - - - - - - - - - - - - - - - - - - - - - - - - - -

            // If no callback is defined return null
            if( typeof failCallBack !== 'function') {
                failCallBack = function( err ) {
                    return null;
                };
            };

            // Cast to string to parse a wide variety of input
            // including the MeasurementUnits object itself
            var stringUnits = String(measureUnit).toLowerCase();
            switch( stringUnits ) {
                case "0":
                case "millimeters":
                case "mm":
                case "millimeter":
                case "zmms":
                case "2053991795":
                    return 2053991795; // MeasurementUnits.MILLIMETERS;
                    break;
                case "1":
                case "inches decimal":
                case "inches_decimal":
                case "inch": // shorthand to decimal
                case "in":
                case "i":
                case "zoll":
                case "pouce":
                case "zind":
                case "2053729892":
                    return 2053729892; // MeasurementUnits.INCHES_DECIMAL;
                    break;
                case "inches":
                case "zinc":
                case "2053729891":
                    return 2053729891; // MeasurementUnits.INCHES;
                    break;
                case "2":
                case "points":
                case "pt":
                case "zpoi":
                case "2054188905":
                    return 2054188905; // MeasurementUnits.POINTS;
                    break;
                case "american_points":
                case "american points":
                case "ap":
                case "apt":
                case "zapt":
                case "1514238068":
                    return 1514238068; // MeasurementUnits.AMERICAN_POINTS;
                    break;
                case "agates":
                case "zagt":
                case "ag":
                case "2051106676":
                    return 2051106676; // MeasurementUnits.AGATES;
                    break;
                case "bai":
                case "zbai":
                case "2051170665":
                    return 2051170665; // MeasurementUnits.BAI;
                    break;
                case "cm":
                case "centimeter":
                case "centimeters":
                case "zcms":
                case "2053336435":
                    return 2053336435; // MeasurementUnits.CENTIMETERS;
                    break;
                case "ciceros":
                case "c":
                case "zcic":
                case "2053335395":
                    return 2053335395; // MeasurementUnits.CICEROS;
                    break;
                case "custom":
                case "cstm":
                case "1131639917":
                    return 1131639917; // MeasurementUnits.CUSTOM;
                    break;
                case "ha":
                case "h":
                case "zha":
                case "1516790048":
                    return 1516790048; // MeasurementUnits.HA;
                    break;
                case "mils":
                case "mil":
                case "thou":
                case "zmil":
                case "2051893612":
                    return 2051893612; // MeasurementUnits.MILS;
                    break;
                case "picas":
                case "pica":
                case "p":
                case "zpic":
                case "2054187363":
                    return 2054187363; // MeasurementUnits.PICAS;
                    break;
                case "pixels":
                case "pixel":
                case "px":
                case "zpix":
                case "2054187384":
                    return 2054187384; // MeasurementUnits.PIXELS;
                    break;
                case "q":
                case "zque":
                case "2054255973":
                    return 2054255973; // MeasurementUnits.Q;
                    break;
                case "u":
                case "zju":
                case "2051691808":
                    return 2051691808; // MeasurementUnits.U;
                    break;
                default:
                    return failCallBack( new Error("Could not parse MeasurementUnits: " + typeof(measureUnit) + " " + stringUnits) );
                    break;
            };
        };

        Rulers.niceNameFor = function( measureUnit, abbreviate ) {
            var abbreviate = (abbreviate === true);
            
            // If no callback is defined return null
            if( typeof failCallBack !== 'function') {
                failCallBack = function( err ) {
                    return null;
                };
            };

            // Cast to string to parse a wide variety of input
            // including the MeasurementUnits object itself
            var stringUnits = Rulers.indUnitsFrom(measureUnit);

            switch(stringUnits) {
                case 2053991795:
                    return abbreviate ? "mm" : "millimeters";
                    break;
                case 2053729892:
                    return abbreviate ? "inch" : "inches";
                    break;
                case 2053729891:
                    return abbreviate ? "inch" : "inches";
                    break;
                case 2054188905:
                    return abbreviate ? "pt" : "points";
                    break;
                case 1514238068:
                    return abbreviate ? "ap" : "American points";
                    break;
                case 2051106676:
                    return abbreviate ? "ag" : "agates";
                    break;
                case 2051170665:
                    return abbreviate ? "bai" : "bai";
                    break;
                case 2053336435:
                    return abbreviate ? "cm" : "centimeters";
                    break;
                case 2053335395:
                    return abbreviate ? "c" : "ciceros";
                    break;
                case 1131639917:
                    return abbreviate ? "cstm" : "custom";
                    break;
                case 1516790048:
                    return abbreviate ? "h" : "Ha";
                    break;
                case 2051893612:
                    return abbreviate ? "mil" : "mils";
                    break;
                case 2054187363:
                    return abbreviate ? "p" : "picas";
                    break;
                case 2054187384:
                    return abbreviate ? "px" : "pixels";
                    break;
                case 2054255973:
                    return abbreviate ? "q" : "Q";
                    break;
                case 2051691808:
                    return abbreviate ? "u" : "U";
                    break;
                default:
                    return failCallBack( new Error("Could not parse MeasurementUnits: " + typeof(measureUnit) + " " + stringUnits) );
                    break;
            };
        };

        Rulers.get = function( Doc ) {
            return { xruler    : Doc.viewPreferences.horizontalMeasurementUnits, 
                     yruler    : Doc.viewPreferences.verticalMeasurementUnits, 
                     origin    : Doc.viewPreferences.rulerOrigin, 
                     zeroPoint : Doc.zeroPoint };
        };

        Rulers.set = function( Doc, UnitObj ) {
            var Original_Units = Rulers.get( Doc );
            // Parse Strings...
            var UnitObj = (typeof UnitObj === "object") ? UnitObj :  {'units' : UnitObj};

            if (UnitObj.hasOwnProperty('units')) {
                // Set both rulers to the same unit
                Rulers._set( Doc, Rulers.indUnitsFrom(UnitObj.units) );
            };

            if (UnitObj.hasOwnProperty('xruler')){
                Rulers._setX( Doc, Rulers.indUnitsFrom(UnitObj.xruler) );
            };

            if (UnitObj.hasOwnProperty('yruler')){
                Rulers._setY( Doc, Rulers.indUnitsFrom(UnitObj.yruler) );
            };

            if(UnitObj.hasOwnProperty('origin')){
                Doc.viewPreferences.rulerOrigin = UnitObj.origin;
            } else { // Use page origin if not defined
                Doc.viewPreferences.rulerOrigin = RulerOrigin.pageOrigin;
            };

            if(UnitObj.hasOwnProperty('zeroPoint')) {
                Doc.zeroPoint = UnitObj.zeroPoint;
            } else { // Use zero point if not defined
                Doc.zeroPoint = [0,0];
            };

            return Original_Units;
        };
    };

    //--------------------------
    // End rulers

    Sky.setUtil(MODULE_PATH, new Rulers() );

})();

(function () {
    var VERSION = 1.1;
    var MODULE_PATH = "bounds";

    var thisModule = Sky.getUtil(MODULE_PATH);
    if( thisModule && thisModule.version >= VERSION) {
        return;
    };

    //--------------------------
    // Start bounds class

    function moduleClass() {
        var bounds = this;

        bounds.version = VERSION;
        bounds.description = "Some utils for transforming InDesign bounds arrays.";
        
        bounds.getInfo = function( boundsArr ){
            // This functions receives boundsArr (y1, x1, y2, x2)
            // and returns an object with boundsArr and info as below
            var topLeftY   = boundsArr[0];
            var topLeftX   = boundsArr[1];
            var botRightY  = boundsArr[2];
            var botRightX  = boundsArr[3];
            var height     = Math.abs(botRightY - topLeftY);
            var width      = Math.abs(botRightX - topLeftX);
            var halfWidth  = 0;
            var halfHeight = 0;

            if(width > 0) {
                halfWidth = width/2;
            };
            if(height > 0) {
                halfHeight = height/2;
            };

            return { bounds    : boundsArr,
                     height    : height,
                     width     : width,
                     topLeft   : {x: topLeftX                , y: topLeftY               } ,
                     topCenter : {x: topLeftX + halfWidth    , y: topLeftY               } ,
                     topRight  : {x: botRightX               , y: topLeftY               } ,
                     midLeft   : {x: topLeftX                , y: topLeftY  + halfHeight } ,
                     midCenter : {x: topLeftX + halfWidth    , y: topLeftY  + halfHeight } ,
                     midRight  : {x: botRightX               , y: topLeftY  + halfHeight } ,
                     botLeft   : {x: topLeftX                , y: botRightY              } ,
                     botCenter : {x: topLeftX + halfWidth    , y: botRightY              } ,
                     botRight  : {x: botRightX               , y: botRightY              } };
        };

        bounds.getRelativeOfset = function( boundsArr, relativeToBounds ){
            // BEWARE: This function expects both bounds to be in the same
            //  X-Y coordinate space, and use the same measure unit!
            //
            //   X--------X--------X
            //   |  |   |   |      |
            //   |--X---X---X------|
            //   |  |   |   |      |
            //   |--X---X---X------|
            //   X  |   | x |      X
            //   |--X---X---X------|
            //   |  |   |   |      |
            //   |  |   |   |      |
            //   |  |   |   |      |
            //   X--------X--------X
            //
            // Bounds Info
            var relBounds  = bounds.getInfo(relativeToBounds);
            var itemBounds = bounds.getInfo(boundsArr);

            return { bounds    : itemBounds.bounds,
                     height    : itemBounds.height,
                     width     : itemBounds.width,
                     topLeft   : { x: itemBounds.topLeft.x   - relBounds.topLeft.x    , y: itemBounds.topLeft.y   - relBounds.topLeft.y    } ,
                     topCenter : { x: itemBounds.topCenter.x - relBounds.topCenter.x  , y: itemBounds.topCenter.y - relBounds.topCenter.y  } ,
                     topRight  : { x: itemBounds.topRight.x  - relBounds.topRight.x   , y: itemBounds.topRight.y  - relBounds.topRight.y   } ,
                     midLeft   : { x: itemBounds.midLeft.x   - relBounds.midLeft.x    , y: itemBounds.midLeft.y   - relBounds.midLeft.y    } ,
                     midCenter : { x: itemBounds.midCenter.x - relBounds.midCenter.x  , y: itemBounds.midCenter.y - relBounds.midCenter.y  } ,
                     midRight  : { x: itemBounds.midRight.x  - relBounds.midRight.x   , y: itemBounds.midRight.y  - relBounds.midRight.y   } ,
                     botLeft   : { x: itemBounds.botLeft.x   - relBounds.botLeft.x    , y: itemBounds.botLeft.y   - relBounds.botLeft.y    } ,
                     botCenter : { x: itemBounds.botCenter.x - relBounds.botCenter.x  , y: itemBounds.botCenter.y - relBounds.botCenter.y  } ,
                     botRight  : { x: itemBounds.botRight.x  - relBounds.botRight.x   , y: itemBounds.botRight.y  - relBounds.botRight.y   } };
        };

        bounds.offset = function( boundsArr, offset ) {
            // Param boundsArr: Array in format [y1, x1, y2, x2]
            // Param offset: Array or Number (Optional) x_y or [x, y]
            if (offset === undefined) offset = [0,0];
            if (typeof offset === "number") offset = [offset,offset];
            var updatedBounds = [0,0,0,0];
            updatedBounds[0] = boundsArr[0] + offset[1];
            updatedBounds[1] = boundsArr[1] + offset[0];
            updatedBounds[2] = boundsArr[2] + offset[1];
            updatedBounds[3] = boundsArr[3] + offset[0];
            return updatedBounds;
        };

        bounds.normalise = function( boundsArr, offset ) {
            // Param boundsArr: Array in format [y1, x1, y2, x2]
            // Param offset: Array or Number (Optional) x_y or [x, y]
            var normalBounds = [0, 0, boundsArr[2]-boundsArr[0], boundsArr[3]-boundsArr[1]];
            return bounds.offset( normalBounds, offset);
        };
    };

    //--------------------------
    // End bounds class

    Sky.setUtil(MODULE_PATH, new moduleClass() );

})();

(function () {
    var VERSION = 1.1;
    var MODULE_PATH = "pages";

    var thisModule = Sky.getUtil(MODULE_PATH);
    if( thisModule && thisModule.version >= VERSION) {
      return;
    };

    //--------------------------
    // Start pages class

    function moduleClass() {
        var pages = this;

        pages.version = VERSION;
        pages.description = "Some page tools for InDesign";

        pages.getBounds = function( pageSpread ) {
            // This functions returns the bounds of the spread or page in current measure units
            if(pageSpread.constructor.name == "Spread") {
                var bounds = [0,0,0,0]; //[y1, x1, y2, x2]
                for (var i = 0; i < pageSpread.pages.length; i++) { 
                    var pBounds = pageSpread.pages[i].bounds;
                    if (bounds[0] > pBounds[0]) bounds[0] = pBounds[0];
                    if (bounds[1] > pBounds[1]) bounds[1] = pBounds[1];
                    if (bounds[2] < pBounds[2]) bounds[2] = pBounds[2];
                    if (bounds[3] < pBounds[3]) bounds[3] = pBounds[3];
                };
                return bounds;
            } else if(pageSpread.constructor.name == "Page") {
                return pageSpread.bounds;
            } else {
                return new TypeError("pages.getBounds: Expected typeof Page or Spread but received " + pageSpread.constructor.name);
            };
        };

        pages.getInfo = function( pageSpread, units ) {
            // Creates and returned the page info object
            var infoPage   = new Object();
            // Param: pageSpread: Object : page or spread
            // Param: units: String, Number or MeasureUnits
            // defaults to points
            infoPage.units = ( units === undefined) ? "pt" : units;
  
            var RulerUtil  = Sky.getUtil("rulers");
            var BoundsUtil = Sky.getUtil("bounds");

            infoPage.kind  = pageSpread.constructor.name;
            infoPage.units = units;
            var spread    = (infoPage.kind === "Page") ? pageSpread.parent : pageSpread;
            var parentDoc = spread.parent;

            // set-n-safe original rulers
            var prevRulers = RulerUtil.set(parentDoc, units);
            var pageSpreadBounds = pages.getBounds( pageSpread );

            // measure the page
            var boundsInfo = BoundsUtil.getInfo( pageSpreadBounds ); 

            // Update infoPage with measures
            infoPage.bounds = boundsInfo.bounds;
            infoPage.width  = boundsInfo.width;
            infoPage.height = boundsInfo.height;

            // Get page bleed and slug settings [y1, x1, y2, x2]
            var docPref = parentDoc.documentPreferences;
            
            var growBounds = function( boundsArr1, boundsArr2 ){
                return [ boundsArr1[0]-boundsArr2[0], boundsArr1[1]-boundsArr2[1],
                         boundsArr1[2]+boundsArr2[2], boundsArr1[3]+boundsArr2[3] ];
            };

            if (infoPage.kind === "Page" && docPref.facingPages && pageSpread.side == PageSideOptions.LEFT_HAND ) {
                // LEFT_HAND Facing pages...
                infoPage.bleedBounds = growBounds(infoPage.bounds,
                  [ docPref.documentBleedTopOffset,
                    docPref.documentBleedOutsideOrRightOffset,
                    docPref.documentBleedInsideOrLeftOffset,
                    docPref.documentBleedBottomOffset ]);
                infoPage.slugsBounds = growBounds(infoPage.bleedBounds,
                  [ docPref.slugTopOffset,
                    docPref.slugRightOrOutsideOffset,
                    docPref.slugInsideOrLeftOffset,
                    docPref.slugBottomOffset ]);
            } else { // RIGHT_HAND or SINGLE_SIDED
                infoPage.bleedBounds = growBounds(infoPage.bounds,
                  [ docPref.documentBleedTopOffset,
                    docPref.documentBleedInsideOrLeftOffset,
                    docPref.documentBleedOutsideOrRightOffset,
                    docPref.documentBleedBottomOffset ]);
                infoPage.slugsBounds = growBounds(infoPage.bleedBounds,
                  [ docPref.slugTopOffset,
                    docPref.slugInsideOrLeftOffset,
                    docPref.slugRightOrOutsideOffset,
                    docPref.slugBottomOffset ]);
            };

            // reset original rulers
            RulerUtil.set(parentDoc, prevRulers);

            return infoPage;
        };

        pages.getByLabel = function( pagesArr, labelStr, keyOption ) {
            // Param pagesArr  : Array   : of pages (e.g. doc.pages or doc.masterSpreads[0].pages )
            // Param labelStr  : String  : the page label
            // Param keyOption : String or Object  : key or object with key 
                                 // key : String, the key to the label, Default undefined
                                 // any : Boolean, return both key-label matches and unkeyed label matches
            // Returns : Array with matches

            var options = {key: undefined, any: false};
            switch (typeof keyOption) {
                case "string":
                    options.key = keyOption;
                    break;
                case "object":
                    if( keyOption.hasOwnProperty('key') && typeof keyOption.key === 'string' ) options.key = keyOption.key;
                    if( keyOption.hasOwnProperty('any') && typeof keyOption.any === 'boolean') options.any = keyOption.any;
                    break;
                default:
                    break;
            };

            var fffound = new Array();

            for ( i=0; pagesArr.length > i; i++ ) {
                var page = pagesArr.item(i);
                if( options.key ) {
                    if( page.extractLabel(options.key) === labelStr ) {
                        fffound.push( page );
                    } else if( options.any && page.label === labelStr ) {
                        fffound.push( page );
                    }
                } else { // No key defined
                    if( page.label === labelStr ){
                        fffound.push( page );
                    };
                };
            };
            return fffound;
        };
    };

    //--------------------------
    // End pages class

    Sky.setUtil(MODULE_PATH, new moduleClass() );

})();

(function () {
    var VERSION = 1.0;
    var MODULE_PATH = "layer";

    var thisModule = Sky.getUtil(MODULE_PATH);
    if( thisModule && thisModule.version >= VERSION) {
      return;
    };

    //--------------------------
    // Start layer class

    function moduleClass() {
        var layerModule = this;

        layerModule.version = VERSION;
        layerModule.description = "Some layer utilities for InDesign";


        layerModule.getByName = function( Doc, layerName, createBool ) {
            // Returns requested layer reference || undefined,
            // if createBool == true; returns new layer with layerName

            // Parse input
            if (!Doc.isValid) return new Error("Not a valid document...");
            var createBool = createBool === true;
            var layerName = String(layerName);

            for (var i=0; i < Doc.layers.length; i++) {
                if (Doc.layers[i].name == layerName) return Doc.layers[i];
            };

            if( createBool ) {
                return Doc.layers.add({name:layerName});
            } else {
                return undefined;
            };
        };

        layerModule.get = function( Doc, layerRefOrName, createBool ) {
            // Returns requested layer reference || undefined,
            // if createBool == true; returns new layer with layerName
            var createBool = createBool === true;

            if (typeof layerRefOrName === 'string' || layerRefOrName instanceof String ) {
                // type of string
                return layerModule.getByName( Doc, layerRefOrName, createBool );
            } else {
                if( layerRefOrName && layerRefOrName.constructor.name === "Layer" ) {
                    // type of layer-ref
                    if( layerRefOrName.isValid ) return layerRefOrName;
                    return layerModule.getByName( Doc, layerRefOrName.name, createBool );
                } else {
                    // Not a layer
                    return undefined;
                };
            };
        };

        layerModule.select = function( Doc, layerRefOrName, createBool ) {
            // returns LayerRef or Error
            var createBool = createBool === true;
            var LayerRef = layerModule.get( Doc, layerRefOrName, createBool );
            try {
                Doc.activeLayer = LayerRef;
                return LayerRef;
            } catch ( error ) {
                return error;
            };
        };

        layerModule.move = function( Doc, layerRefOrName, afterLayerNo, createBool ) {
            // returns LayerRef or Error
            var createBool = createBool === true;
            var LayerRef = layerModule.get( Doc, layerRefOrName, createBool );

            if( LayerRef === undefined ) {
                return new Error("Could not resolve layer reference.");
            };

            try {
                LayerRef.move( LocationOptions.AFTER, Doc.layers[afterLayerNo] );
                return LayerRef;
            } catch ( error ) {
                return error;
            };
        };

        layerModule.moveAndSelect = function( Doc, layerRefOrName, afterLayerNo, createBool ) {
            var createBool = createBool === true;
            var LayerRef = layerModule.select(Doc, layerRefOrName, createBool);
            if( LayerRef.isValid ) {
                return layerModule.move( Doc, LayerRef, afterLayerNo);
            } else {
                if (LayerRef instanceof Error) {
                    return LayerRef;
                } else {
                    return new Error("Could not resolve layer reference.");
                };
            };
        };

        layerModule.locker = function( LayerRef, lockBool ) {
            // lockBool: True:  layer will be locked
            // lockBool: False: layer will be unlocked
            // lockBool: Not true nor false: Layer lock will be toggled
            
            // Returns: The previous lock state
            var prevLockState = LayerRef.locked;

            if(typeof lockBool !== 'boolean'){
                // Toggle!
                var lockBool = !prevLockState;
            };

            if(lockBool){
                LayerRef.locked = true;
                return prevLockState;
            } else {
                LayerRef.locked = false;
                return prevLockState;
            };
        };

        layerModule.validOr = function( LayerRef, orValue ) {
            return ( LayerRef && LayerRef.constructor.name === "Layer" && 
                     LayerRef.isValid ) ? LayerRef : orValue;
        };

    }; // End moduleClass

    //--------------------------
    // End layer class

    Sky.setUtil(MODULE_PATH, new moduleClass() );

})();

(function () {
    var VERSION = 0.4;
    var MODULE_PATH = "pageitems";

    var thisModule = Sky.getUtil(MODULE_PATH);
    if( thisModule && thisModule.version >= VERSION) {
      return;
    };

    //--------------------------
    // Start pageitems class

    function moduleClass() {
        var pageitems = this;

        pageitems.version = VERSION;
        pageitems.description = "Utilities that create or target page items in InDesign.";

        var LoadCallback = function (err, module){
            // Throws an error when dependency could not be loaded...
            if( err instanceof Error || err instanceof TypeError ) {
                throw new TypeError( err.message, $.fileName, $.line);
            };
            return module;
        };

        // Load any needed modules
        var PageUtil = Sky.getUtil("pages", LoadCallback );

        pageitems.updateProps = function( pageItems, UpdateProps ) {
            // This tool can quickly set a bunch of properties
            var itemsArray = ( Array.isArray(pageItems) ) ? pageItems : [ pageItems ];
            if (typeof UpdateProps !== 'object') throw new Error("Update props expects an Object but received " + typeof UpdateProps);

            for (var i = 0, len = itemsArray.length; i < len; i++) {
                for(var propName in UpdateProps) {
                    itemsArray[i][propName] = UpdateProps[propName];
                };
            };

            return pageItems;
        };

        pageitems.getParentPage = function ( PageItem ) {

            switch ( PageItem.constructor.name ) {
                case "Page":
                    return PageItem;
                    break;
                case "Document":
                case "Spread":
                case "MasterSpread":
                    return PageItem.pages.item(0);
                    break;
                case "Button":
                case "ComboBox":
                case "CheckBox":
                case "EPSText":
                case "FormField":
                case "Graphic":
                case "GraphicLine":
                case "Group":
                case "HtmlItem":
                case "ListBox":
                case "ListBox":
                case "MediaItem":
                case "Movie":
                case "MultiStateObject":
                case "Oval":
                case "PageItem": 
                case "Polygon":
                case "RadioButton":
                case "Rectangle":
                case "SignatureField":
                case "SignatureField":
                case "Sound":
                case "SplineItem":
                case "TextBox":
                case "TextFrame":
                    if( PageItem.parentPage ) {
                        return PageItem.parentPage;  
                    } else if (PageItem.parent.constructor.name === "Spread" ) {
                        // As Marc Autret would do it (https://forums.adobe.com/thread/1880486)
                        var pIndex = 0;
                        var x = PageItem.resolve(AnchorPoint.centerAnchor,CoordinateSpaces.SPREAD_COORDINATES)[0][0];
                        var allPages = PageItem.parent.pages.everyItem().getElements();
                        for (var d = 1/0, i = 0; i < allPages.length; i++) { 
                            diff = Math.abs(x - allPages[i].resolve(AnchorPoint.centerAnchor,CoordinateSpaces.SPREAD_COORDINATES)[0][0]);  
                            if( diff < d ){ d=diff; pIndex=i; }
                        };
                        return PageItem.parent.pages[pIndex];
                    } else {
                       return new Error("Page item does not have a parent page or spread. Found " + PageItem.parent.constructor.name );
                    };
                    break;
                case "Character":
                case "Line":
                case "Paragraph":
                case "Text":
                case "TextColumn":
                case "TextStyleRange":
                case "Word":
                case "InsertionPoint":
                    return PageItem.parentTextFrames[0].parentPage;
                    break;
                case "Table":
                case "Cell":
                case "Column":
                case "Row":
                case "Footnote":
                    // recurse
                    return pageitems.getParentPage(PageItem.parent);
                    break;
                default:
                    return new Error("Could not get parent page from " + PageItem.constructor.name );
                    break;
            };
        };

        pageitems.getParentSpread = function( PageItem ) {
            var parentPage = pageitems.getParentPage( PageItem );
            if( parentPage.constructor.name === "Page" ) {
                return parentPage.parent;
            } else {
                return parentPage; // error
            };
        };

        pageitems.getParentDoc = function( PageItem ) {
            var parentSpread = pageitems.getParentSpread( PageItem );
            if( parentSpread.constructor.name === "Spread" ) {
                return parentSpread.parent;
            } else {
                return parentSpread; // error
            };
        };

        pageitems.addTextFrame = function( SpreadPage, Options ){
            // Parameter   : SpreadPage : A spread or page
            // Parameter   : Options    : optional object with optional properties:
                // geometricBounds    : desired bounds
                // itemLayer          : stringName or layer reference
                // rotationAngle      : number
                // label              : string
                // fillColor          : stringName of swatch reference
                // strokeColor        : stringName of swatch reference
                // strokeWidth        : width of the stroke in points
                // appliedObjectStyle : stringName or style reference
                // contents           : string
                // paragraphStyle     : string or reference
                // autoSizingType     : string
            // Returns     : New TextFrame
            // Description : Adds a new TextFrame on SpreadPage

            var overRideProps = {};
            var Options  = (typeof Options === 'object') ? Options : {}; // optional
            var pageKind = SpreadPage.constructor.name;
            var Spread   = (pageKind === "Page") ? SpreadPage.parent : SpreadPage;
            var Doc      = Spread.parent;

            // Setting good standard values is important as users can have different presets        
            // We need to first apply appliedObjectStyle and then add any custom over-rides

            var initProps = {
                itemLayer          : (Options.itemLayer)          ? Options.itemLayer          : Doc.activeLayer,
                appliedObjectStyle : (Options.appliedObjectStyle) ? Options.appliedObjectStyle : Spread.parent.objectStyles.item(0),
                label              : (Options.label)              ? Options.label              : "",
                rotationAngle      : (Options.rotationAngle)      ? Options.rotationAngle      : 0
            };

            for(var k in Options) {
                if ( k != "appliedObjectStyle" && k != "appliedParagraphStyle" && k != "autoSizingType") overRideProps[k] = Options[k];
            };

            var tf = pageitems.updateProps( SpreadPage.textFrames.add( initProps ), overRideProps );
            // Apply paragraphStyle to contents
            if( Options.appliedParagraphStyle ) {
                tf.paragraphs.everyItem().appliedParagraphStyle = Options.appliedParagraphStyle;
            };

            if( Options.autoSizingType ) {
                switch( Options.autoSizingType ) {
                    case "HEIGHT_ONLY":
                         tf.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_ONLY;
                        break;
                    case "WIDTH_ONLY":
                        tf.textFramePreferences.autoSizingType = AutoSizingTypeEnum.WIDTH_ONLY;
                        break;
                    case "HEIGHT_AND_WIDTH":
                        tf.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
                        break;
                    case "HEIGHT_AND_WIDTH_PROPORTIONALLY":
                        tf.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH_PROPORTIONALLY;
                        break;
                    default:
                        break;
                };
            };

            return tf;
        };

        pageitems.addRect = function( SpreadPage, Options ){
            // Parameter   : SpreadPage : A spread or page
            // Parameter   : Options    : Optional object with optional properties:
                // geometricBounds    : desired bounds
                // itemLayer          : stringName or layer reference
                // rotationAngle      : number
                // label              : string
                // fillColor          : stringName of swatch reference
                // strokeColor        : stringName of swatch reference
                // strokeWidth        : width of the stroke in points
                // appliedObjectStyle : stringName or style reference
            // Returns     : New Rectangle or error
            // Description : Adds a new rectangle on SpreadPage at myBounds

            var overRideProps = {};
            var Options  = (typeof Options === 'object') ? Options : {}; // optional
            var pageKind = SpreadPage.constructor.name;
            var Spread   = (pageKind === "Page") ? SpreadPage.parent : SpreadPage;
            var Doc      = Spread.parent;

            // Setting good standard values is important as users can have different presets        
            // We need to first apply appliedObjectStyle and then add any custom over-rides
    
            var initProps = {
                itemLayer          : (Options.hasOwnProperty("itemLayer")          ) ? Options.itemLayer          : Doc.activeLayer,
                appliedObjectStyle : (Options.hasOwnProperty("appliedObjectStyle") ) ? Options.appliedObjectStyle : Spread.parent.objectStyles.item(0)
            };

            for(var k in Options) {
                if ( k != "appliedObjectStyle") overRideProps[k] = Options[k];
            };

            // It would be cool add a custom width and height parameter as well as x and y instead of bounds?
            // So we can give the bounds OR width height with optional x, y? x, y and width height would over-ride bounds.

            try {
                var rect = SpreadPage.rectangles.add( initProps );
                return pageitems.updateProps( rect, overRideProps );
            } catch( error ){
                return error;
            };
        };

        pageitems.addRectToPage = function( SpreadPage, Options ){
            // Parameter   : SpreadPage : A spread or page
            // Returns     : New Rectangle or Error
            // Description : Adds a new rectangle to the bounds of SpreadPage
            return pageitems.boundsToRef( pageitems.addRect(SpreadPage, Options), SpreadPage );
        };
    
        pageitems.addRectToBleed = function( SpreadPage, Options ){
            // Parameter   : SpreadPage : A spread or page
            // Returns     : New Rectangle or Error
            // Description : Adds a new rectangle to the bleed bounds of SpreadPage
            return pageitems.boundsToBleed( pageitems.addRect(SpreadPage, Options), SpreadPage );
        };

        pageitems.boundsToRef = function( pageItems, Reference ){
            // Parameter   : pageItems  : A page item or array of pageItems
            // Parameter   : Reference  : Optional: Any ref that has the geometricBounds property, parentPage if not defined
            // Returns     : Array of updated pageItems
            // Description : Sets bounding box of pageItems to ParentPage bounds

            var _pageItems = ( Array.isArray(pageItems) ) ? pageItems : [ pageItems ];
            var Reference = ( Reference.hasOwnProperty('geometricBounds') ) ? Reference : undefined;

            for (var i = 0, len = _pageItems.length; i < len; i++) {
                if( Reference === undefined) {
                    var refBounds = PageUtil.getInfo( _pageItems[i].parentPage ).bounds;
                } else {
                    var refBounds = Reference.geometricBounds;
                };
                _pageItems[i].geometricBounds = refBounds;
            };
            return pageItems;
        };

        pageitems.boundsToBleed = function( pageItems, SpreadPage ){
            // Parameter   : SpreadPage : A spread or page
            // Parameter   : pageItems  : A page item or array of pageItems
            // Returns     : pageItems
            // Description : Updates bounding box of pageItems to SpreadPage bleed

            var pageItems = ( Array.isArray(pageItems) ) ? pageItems : [ pageItems ];

            for (var i = 0, len = pageItems.length; i < len; i++) {
                var pageRef  = ( typeof SpreadPage === undefined ) ? pageItems[i].parentPage : SpreadPage;
                var pageInfo = PageUtil.getInfo( pageRef );
                pageItems[i].geometricBounds = pageInfo.bleedBounds;
            };
        };
    };

    //--------------------------
    // End pageitems class

    Sky.setUtil(MODULE_PATH, new moduleClass() );

})();


//--------------------------
// Load Application
//--------------------------
Endpapers.create = function ( Settings ) {

    // Load ExtendScript-Modules
    var Rulers    = Sky.getUtil("rulers",    Sky.throwCallback($.fileName, $.line));
    var LayerUtil = Sky.getUtil("layer",     Sky.throwCallback($.fileName, $.line));
    var PageItems = Sky.getUtil("pageitems", Sky.throwCallback($.fileName, $.line));

    // We need to validate settings here
    // 1. Do page margins fit within page or do we set them to 0 if not fitting?
    // 2. Is the size of the page bigger then min page size of InDesign

    // Set defaults
    with (app.marginPreferences){
        // Save the current application default margin preferences
        var originalTop    = top;
        var originalLeft   = left;
        var originalBottom = bottom;
        var originalRight  = right;
        var originalColumnGutter = columnGutter;
        var originalColumnCount  = columnCount;
        
        // Set the application default margin preferences.
        top    = Settings.marginTop   + "mm";
        left   = Settings.marginLeft  + "mm";
        bottom = Settings.marginBot   + "mm";
        right  = Settings.marginRight + "mm";
        columnGutter = 0;
        columnCount  = 1;
    };

    // Make a new document.
    var Doc = app.documents.add();

    var originalRulers = Rulers.set( Doc, Settings.units );

    // Safe title in meta
    Doc.metadataPreferences.documentTitle = Settings.booktitle;
    
    try {
        with(Doc.documentPreferences){
            pageHeight  = Settings.height;
            pageWidth   = Settings.width;
            facingPages = true;
            //Bleed
            documentBleedUniformSize = true;
            documentBleedTopOffset   = Settings.bleed;
            // Slug
            documentSlugUniformSize = true;
            slugTopOffset = (Settings.bleed + 5);
        };
    } catch(err){
        alert("InDesign can't create a page that size.");
        return err;
    };

    var myEndPaperSpread = Doc.spreads.add(LocationOptions.AFTER,Doc.spreads[0]);
    
    // get Layer
    var myLayer = LayerUtil.select(Doc, "Art", true);
    // unlock layer
    var originalLock = LayerUtil.locker(myLayer, false);

    var myRect = PageItems.addRectToBleed( myEndPaperSpread, {itemLayer:myLayer, contentType:ContentType.GRAPHIC_TYPE} );

    // restore layer lock
    LayerUtil.locker(myLayer, originalLock);

    // duplicate the page
    Doc.spreads[0].duplicate(LocationOptions.AFTER, Doc.spreads[1]);
    
    // Now have the basic settings we can duplicate this setup for the back end-papers
    var spreadLen = Doc.spreads.length;
    for(var i=0; i<spreadLen; i++){
        Doc.spreads[i].allowPageShuffle = false;
        Doc.spreads[i].duplicate(LocationOptions.AFTER, Doc.spreads[Doc.spreads.length-1]);
    }

    Doc.pages[0].label = "Stuckdown";
    Doc.pages[Doc.pages.length-1].label = "Stuckdown";
    
    // Add the Stuck-down text on first and last page
    //var myParagraphStyle = CB.Slugs.getMeasureParagraphStyle(CB, Doc, "measurements", CB.Settings.registration_font);
    //var regLayer         = CB.Tools.getAndSelectLayer(  Doc, "Registration");

    //var myPage = Doc.pages[0];
    //var PageIO = CB.Tools.makePageInfoObject(CB, Doc, myPage, 0);
    //CB.Tools.addTextFrame(CB, myPage, PageIO.bounds, "< Stuckdown >", myParagraphStyle, 0, "Stuck-down");

    //myPage = Doc.pages[Doc.pages.length-1];
    //PageIO = CB.Tools.makePageInfoObject(CB, Doc, myPage, 0);
    //CB.Tools.addTextFrame(CB, myPage, PageIO.bounds, "< Stuckdown >", myParagraphStyle, 0, "Stuck-down");

    //Reset the application default margin preferences to their former state.
    with (app.marginPreferences){
        top    = originalTop;
        left   = originalLeft;
        bottom = originalBottom;
        right  = originalRight;
        columnGutter = originalColumnGutter;
        columnCount  = originalColumnCount;
    };

    // reset original rulers
    Rulers.set(Doc, originalRulers);

    return Doc;

};

Endpapers.getDocSettings = function( Doc, measureUnit ) {

    if(!Doc.isValid) {
        throw new Error("Endpapers.getDocSettings: Doc is not a valid document.");
    };
    
    // Load ExtendScript-Modules
    var Rulers = Sky.getUtil("rulers", Sky.throwCallback($.fileName, $.line));

    var originalRulers = Rulers.set( Doc, measureUnit );

    var DocSettings = {
        booktitle   : Doc.metadataPreferences.documentTitle,
        units       : measureUnit,
        width       : Doc.documentPreferences.pageWidth,
        height      : Doc.documentPreferences.pageHeight,
        bleed       : Doc.documentPreferences.documentBleedTopOffset,
        marginTop   : Doc.marginPreferences.top,
        marginBot   : Doc.marginPreferences.bottom,
        marginLeft  : Doc.marginPreferences.left,
        marginRight : Doc.marginPreferences.right
    };

    Rulers.set( Doc, measureUnit );

    return DocSettings;
};

Endpapers.showUI = function ( Settings ) {
    
    // Load ExtendScript-Modules
    var Rulers = Sky.getUtil("rulers", Sky.throwCallback($.fileName, $.line));

    // Process Settings
    //- - - - - - - - - 
    var Data = { booktitle   : "Untitled",
                 units       : (Settings && Settings.units)? Settings.units : "mm",
                 width       : 0,
                 height      : 0,
                 bleed       : 5,
                 marginTop   : 0,
                 marginBot   : 0, 
                 marginLeft  : 0, 
                 marginRight : 0 };

    var sourceDoc = (Settings && Settings.sourceDoc)? Settings.sourceDoc : app.documents[0];

    if( sourceDoc.isValid ) {
        Data = Endpapers.getDocSettings( sourceDoc, Data.units );
    };

    // Override Settings
    Data.booktitle   = ( Settings && Settings.booktitle   )? Settings.booktitle   : Data.booktitle;
    Data.width       = ( Settings && Settings.width       )? Settings.width       : Data.width;
    Data.height      = ( Settings && Settings.height      )? Settings.height      : Data.height;
    Data.bleed       = ( Settings && Settings.bleed       )? Settings.bleed       : Data.bleed;
    Data.marginTop   = ( Settings && Settings.marginTop   )? Settings.marginTop   : Data.marginTop;
    Data.marginBot   = ( Settings && Settings.marginBot   )? Settings.marginBot   : Data.marginBot;
    Data.marginLeft  = ( Settings && Settings.marginLeft  )? Settings.marginLeft  : Data.marginLeft;
    Data.marginRight = ( Settings && Settings.marginRight )? Settings.marginRight : Data.marginRight;

    // Build UI
    //- - - - - - - - - 

    var dlg = app.dialogs.add({name:"Create Endpapers"});

    with(dlg.dialogColumns.add()){
        with(dialogRows.add()){
            with(dialogColumns.add()){
                var widthLabel  = staticTexts.add({staticLabel:"Width:"});
                var heightLabel = staticTexts.add({staticLabel:"Height:"});
                var bleedLabel  = staticTexts.add({staticLabel:"Bleed:"});
            }
            with(dialogColumns.add()){
                // MeasurementEditbox values are always in points
                var widthField  = measurementEditboxes.add({ editUnits: MeasurementUnits.MILLIMETERS, editValue: Rulers.convert(Data.width,  Data.units, "pt", 3) });
                var heightField = measurementEditboxes.add({ editUnits: MeasurementUnits.MILLIMETERS, editValue: Rulers.convert(Data.height, Data.units, "pt", 3) });
                var bleedField  = measurementEditboxes.add({ editUnits: MeasurementUnits.MILLIMETERS, editValue: Rulers.convert(Data.bleed,  Data.units, "pt", 3) });
            }
        }
    };

    if(dlg.show() == true){
        // TODO: Validate
        Data.height = Rulers.convert(heightField.editValue, "pt", Data.units, 3); 
        Data.width  = Rulers.convert(widthField.editValue,  "pt", Data.units, 3); 
        Data.bleed  = Rulers.convert(bleedField.editValue,  "pt", Data.units, 3); 
        return Endpapers.create( Data );
    } else {
        return "User pressed cancel";
    };
};

Endpapers.loadMenu = function ( ) {

    // Load ExtendScript-Modules
    var MenuLoader = Sky.getUtil("menuloader", Sky.throwCallback($.fileName, $.line) );

    var MenuTemplate = new MenuLoader.template("Endpapers...", {
        path: [app.translateKeyString('$ID/TouchMenuFile'), app.translateKeyString("$ID/New")],
        loc: LocationOptions.AFTER,
        ref: app.translateKeyString("$ID/Document") + "...",
        fun: Endpapers.showUI
    });

    MenuLoader.load( MenuTemplate, true );

};

//--------------------------
// Load Menu
//--------------------------
try {
    Endpapers.loadMenu();
} catch( err ) {
    alert("Endpapers Plugin:\n" + err.message + " (Line " + err.line + " in file " + err.fileName + ")");
};
