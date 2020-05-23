(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}((function () { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var runtime_1 = createCommonjsModule(function (module) {
	  /**
	   * Copyright (c) 2014-present, Facebook, Inc.
	   *
	   * This source code is licensed under the MIT license found in the
	   * LICENSE file in the root directory of this source tree.
	   */
	  var runtime = function (exports) {

	    var Op = Object.prototype;
	    var hasOwn = Op.hasOwnProperty;
	    var undefined$1; // More compressible than void 0.

	    var $Symbol = typeof Symbol === "function" ? Symbol : {};
	    var iteratorSymbol = $Symbol.iterator || "@@iterator";
	    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
	    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

	    function wrap(innerFn, outerFn, self, tryLocsList) {
	      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
	      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
	      var generator = Object.create(protoGenerator.prototype);
	      var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
	      // .throw, and .return methods.

	      generator._invoke = makeInvokeMethod(innerFn, self, context);
	      return generator;
	    }

	    exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
	    // record like context.tryEntries[i].completion. This interface could
	    // have been (and was previously) designed to take a closure to be
	    // invoked without arguments, but in all the cases we care about we
	    // already have an existing method we want to call, so there's no need
	    // to create a new function object. We can even get away with assuming
	    // the method takes exactly one argument, since that happens to be true
	    // in every case, so we don't have to touch the arguments object. The
	    // only additional allocation required is the completion record, which
	    // has a stable shape and so hopefully should be cheap to allocate.

	    function tryCatch(fn, obj, arg) {
	      try {
	        return {
	          type: "normal",
	          arg: fn.call(obj, arg)
	        };
	      } catch (err) {
	        return {
	          type: "throw",
	          arg: err
	        };
	      }
	    }

	    var GenStateSuspendedStart = "suspendedStart";
	    var GenStateSuspendedYield = "suspendedYield";
	    var GenStateExecuting = "executing";
	    var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
	    // breaking out of the dispatch switch statement.

	    var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
	    // .constructor.prototype properties for functions that return Generator
	    // objects. For full spec compliance, you may wish to configure your
	    // minifier not to mangle the names of these two functions.

	    function Generator() {}

	    function GeneratorFunction() {}

	    function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
	    // don't natively support it.


	    var IteratorPrototype = {};

	    IteratorPrototype[iteratorSymbol] = function () {
	      return this;
	    };

	    var getProto = Object.getPrototypeOf;
	    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

	    if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
	      // This environment has a native %IteratorPrototype%; use it instead
	      // of the polyfill.
	      IteratorPrototype = NativeIteratorPrototype;
	    }

	    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
	    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
	    GeneratorFunctionPrototype.constructor = GeneratorFunction;
	    GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction"; // Helper for defining the .next, .throw, and .return methods of the
	    // Iterator interface in terms of a single ._invoke method.

	    function defineIteratorMethods(prototype) {
	      ["next", "throw", "return"].forEach(function (method) {
	        prototype[method] = function (arg) {
	          return this._invoke(method, arg);
	        };
	      });
	    }

	    exports.isGeneratorFunction = function (genFun) {
	      var ctor = typeof genFun === "function" && genFun.constructor;
	      return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
	      // do is to check its .name property.
	      (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
	    };

	    exports.mark = function (genFun) {
	      if (Object.setPrototypeOf) {
	        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
	      } else {
	        genFun.__proto__ = GeneratorFunctionPrototype;

	        if (!(toStringTagSymbol in genFun)) {
	          genFun[toStringTagSymbol] = "GeneratorFunction";
	        }
	      }

	      genFun.prototype = Object.create(Gp);
	      return genFun;
	    }; // Within the body of any async function, `await x` is transformed to
	    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
	    // `hasOwn.call(value, "__await")` to determine if the yielded value is
	    // meant to be awaited.


	    exports.awrap = function (arg) {
	      return {
	        __await: arg
	      };
	    };

	    function AsyncIterator(generator, PromiseImpl) {
	      function invoke(method, arg, resolve, reject) {
	        var record = tryCatch(generator[method], generator, arg);

	        if (record.type === "throw") {
	          reject(record.arg);
	        } else {
	          var result = record.arg;
	          var value = result.value;

	          if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
	            return PromiseImpl.resolve(value.__await).then(function (value) {
	              invoke("next", value, resolve, reject);
	            }, function (err) {
	              invoke("throw", err, resolve, reject);
	            });
	          }

	          return PromiseImpl.resolve(value).then(function (unwrapped) {
	            // When a yielded Promise is resolved, its final value becomes
	            // the .value of the Promise<{value,done}> result for the
	            // current iteration.
	            result.value = unwrapped;
	            resolve(result);
	          }, function (error) {
	            // If a rejected Promise was yielded, throw the rejection back
	            // into the async generator function so it can be handled there.
	            return invoke("throw", error, resolve, reject);
	          });
	        }
	      }

	      var previousPromise;

	      function enqueue(method, arg) {
	        function callInvokeWithMethodAndArg() {
	          return new PromiseImpl(function (resolve, reject) {
	            invoke(method, arg, resolve, reject);
	          });
	        }

	        return previousPromise = // If enqueue has been called before, then we want to wait until
	        // all previous Promises have been resolved before calling invoke,
	        // so that results are always delivered in the correct order. If
	        // enqueue has not been called before, then it is important to
	        // call invoke immediately, without waiting on a callback to fire,
	        // so that the async generator function has the opportunity to do
	        // any necessary setup in a predictable way. This predictability
	        // is why the Promise constructor synchronously invokes its
	        // executor callback, and why async functions synchronously
	        // execute code before the first await. Since we implement simple
	        // async functions in terms of async generators, it is especially
	        // important to get this right, even though it requires care.
	        previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
	        // invocations of the iterator.
	        callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
	      } // Define the unified helper method that is used to implement .next,
	      // .throw, and .return (see defineIteratorMethods).


	      this._invoke = enqueue;
	    }

	    defineIteratorMethods(AsyncIterator.prototype);

	    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
	      return this;
	    };

	    exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
	    // AsyncIterator objects; they just return a Promise for the value of
	    // the final result produced by the iterator.

	    exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
	      if (PromiseImpl === void 0) PromiseImpl = Promise;
	      var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
	      return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
	      : iter.next().then(function (result) {
	        return result.done ? result.value : iter.next();
	      });
	    };

	    function makeInvokeMethod(innerFn, self, context) {
	      var state = GenStateSuspendedStart;
	      return function invoke(method, arg) {
	        if (state === GenStateExecuting) {
	          throw new Error("Generator is already running");
	        }

	        if (state === GenStateCompleted) {
	          if (method === "throw") {
	            throw arg;
	          } // Be forgiving, per 25.3.3.3.3 of the spec:
	          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


	          return doneResult();
	        }

	        context.method = method;
	        context.arg = arg;

	        while (true) {
	          var delegate = context.delegate;

	          if (delegate) {
	            var delegateResult = maybeInvokeDelegate(delegate, context);

	            if (delegateResult) {
	              if (delegateResult === ContinueSentinel) continue;
	              return delegateResult;
	            }
	          }

	          if (context.method === "next") {
	            // Setting context._sent for legacy support of Babel's
	            // function.sent implementation.
	            context.sent = context._sent = context.arg;
	          } else if (context.method === "throw") {
	            if (state === GenStateSuspendedStart) {
	              state = GenStateCompleted;
	              throw context.arg;
	            }

	            context.dispatchException(context.arg);
	          } else if (context.method === "return") {
	            context.abrupt("return", context.arg);
	          }

	          state = GenStateExecuting;
	          var record = tryCatch(innerFn, self, context);

	          if (record.type === "normal") {
	            // If an exception is thrown from innerFn, we leave state ===
	            // GenStateExecuting and loop back for another invocation.
	            state = context.done ? GenStateCompleted : GenStateSuspendedYield;

	            if (record.arg === ContinueSentinel) {
	              continue;
	            }

	            return {
	              value: record.arg,
	              done: context.done
	            };
	          } else if (record.type === "throw") {
	            state = GenStateCompleted; // Dispatch the exception by looping back around to the
	            // context.dispatchException(context.arg) call above.

	            context.method = "throw";
	            context.arg = record.arg;
	          }
	        }
	      };
	    } // Call delegate.iterator[context.method](context.arg) and handle the
	    // result, either by returning a { value, done } result from the
	    // delegate iterator, or by modifying context.method and context.arg,
	    // setting context.delegate to null, and returning the ContinueSentinel.


	    function maybeInvokeDelegate(delegate, context) {
	      var method = delegate.iterator[context.method];

	      if (method === undefined$1) {
	        // A .throw or .return when the delegate iterator has no .throw
	        // method always terminates the yield* loop.
	        context.delegate = null;

	        if (context.method === "throw") {
	          // Note: ["return"] must be used for ES3 parsing compatibility.
	          if (delegate.iterator["return"]) {
	            // If the delegate iterator has a return method, give it a
	            // chance to clean up.
	            context.method = "return";
	            context.arg = undefined$1;
	            maybeInvokeDelegate(delegate, context);

	            if (context.method === "throw") {
	              // If maybeInvokeDelegate(context) changed context.method from
	              // "return" to "throw", let that override the TypeError below.
	              return ContinueSentinel;
	            }
	          }

	          context.method = "throw";
	          context.arg = new TypeError("The iterator does not provide a 'throw' method");
	        }

	        return ContinueSentinel;
	      }

	      var record = tryCatch(method, delegate.iterator, context.arg);

	      if (record.type === "throw") {
	        context.method = "throw";
	        context.arg = record.arg;
	        context.delegate = null;
	        return ContinueSentinel;
	      }

	      var info = record.arg;

	      if (!info) {
	        context.method = "throw";
	        context.arg = new TypeError("iterator result is not an object");
	        context.delegate = null;
	        return ContinueSentinel;
	      }

	      if (info.done) {
	        // Assign the result of the finished delegate to the temporary
	        // variable specified by delegate.resultName (see delegateYield).
	        context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

	        context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
	        // exception, let the outer generator proceed normally. If
	        // context.method was "next", forget context.arg since it has been
	        // "consumed" by the delegate iterator. If context.method was
	        // "return", allow the original .return call to continue in the
	        // outer generator.

	        if (context.method !== "return") {
	          context.method = "next";
	          context.arg = undefined$1;
	        }
	      } else {
	        // Re-yield the result returned by the delegate method.
	        return info;
	      } // The delegate iterator is finished, so forget it and continue with
	      // the outer generator.


	      context.delegate = null;
	      return ContinueSentinel;
	    } // Define Generator.prototype.{next,throw,return} in terms of the
	    // unified ._invoke helper method.


	    defineIteratorMethods(Gp);
	    Gp[toStringTagSymbol] = "Generator"; // A Generator should always return itself as the iterator object when the
	    // @@iterator function is called on it. Some browsers' implementations of the
	    // iterator prototype chain incorrectly implement this, causing the Generator
	    // object to not be returned from this call. This ensures that doesn't happen.
	    // See https://github.com/facebook/regenerator/issues/274 for more details.

	    Gp[iteratorSymbol] = function () {
	      return this;
	    };

	    Gp.toString = function () {
	      return "[object Generator]";
	    };

	    function pushTryEntry(locs) {
	      var entry = {
	        tryLoc: locs[0]
	      };

	      if (1 in locs) {
	        entry.catchLoc = locs[1];
	      }

	      if (2 in locs) {
	        entry.finallyLoc = locs[2];
	        entry.afterLoc = locs[3];
	      }

	      this.tryEntries.push(entry);
	    }

	    function resetTryEntry(entry) {
	      var record = entry.completion || {};
	      record.type = "normal";
	      delete record.arg;
	      entry.completion = record;
	    }

	    function Context(tryLocsList) {
	      // The root entry object (effectively a try statement without a catch
	      // or a finally block) gives us a place to store values thrown from
	      // locations where there is no enclosing try statement.
	      this.tryEntries = [{
	        tryLoc: "root"
	      }];
	      tryLocsList.forEach(pushTryEntry, this);
	      this.reset(true);
	    }

	    exports.keys = function (object) {
	      var keys = [];

	      for (var key in object) {
	        keys.push(key);
	      }

	      keys.reverse(); // Rather than returning an object with a next method, we keep
	      // things simple and return the next function itself.

	      return function next() {
	        while (keys.length) {
	          var key = keys.pop();

	          if (key in object) {
	            next.value = key;
	            next.done = false;
	            return next;
	          }
	        } // To avoid creating an additional object, we just hang the .value
	        // and .done properties off the next function object itself. This
	        // also ensures that the minifier will not anonymize the function.


	        next.done = true;
	        return next;
	      };
	    };

	    function values(iterable) {
	      if (iterable) {
	        var iteratorMethod = iterable[iteratorSymbol];

	        if (iteratorMethod) {
	          return iteratorMethod.call(iterable);
	        }

	        if (typeof iterable.next === "function") {
	          return iterable;
	        }

	        if (!isNaN(iterable.length)) {
	          var i = -1,
	              next = function next() {
	            while (++i < iterable.length) {
	              if (hasOwn.call(iterable, i)) {
	                next.value = iterable[i];
	                next.done = false;
	                return next;
	              }
	            }

	            next.value = undefined$1;
	            next.done = true;
	            return next;
	          };

	          return next.next = next;
	        }
	      } // Return an iterator with no values.


	      return {
	        next: doneResult
	      };
	    }

	    exports.values = values;

	    function doneResult() {
	      return {
	        value: undefined$1,
	        done: true
	      };
	    }

	    Context.prototype = {
	      constructor: Context,
	      reset: function (skipTempReset) {
	        this.prev = 0;
	        this.next = 0; // Resetting context._sent for legacy support of Babel's
	        // function.sent implementation.

	        this.sent = this._sent = undefined$1;
	        this.done = false;
	        this.delegate = null;
	        this.method = "next";
	        this.arg = undefined$1;
	        this.tryEntries.forEach(resetTryEntry);

	        if (!skipTempReset) {
	          for (var name in this) {
	            // Not sure about the optimal order of these conditions:
	            if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
	              this[name] = undefined$1;
	            }
	          }
	        }
	      },
	      stop: function () {
	        this.done = true;
	        var rootEntry = this.tryEntries[0];
	        var rootRecord = rootEntry.completion;

	        if (rootRecord.type === "throw") {
	          throw rootRecord.arg;
	        }

	        return this.rval;
	      },
	      dispatchException: function (exception) {
	        if (this.done) {
	          throw exception;
	        }

	        var context = this;

	        function handle(loc, caught) {
	          record.type = "throw";
	          record.arg = exception;
	          context.next = loc;

	          if (caught) {
	            // If the dispatched exception was caught by a catch block,
	            // then let that catch block handle the exception normally.
	            context.method = "next";
	            context.arg = undefined$1;
	          }

	          return !!caught;
	        }

	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];
	          var record = entry.completion;

	          if (entry.tryLoc === "root") {
	            // Exception thrown outside of any try block that could handle
	            // it, so set the completion value of the entire function to
	            // throw the exception.
	            return handle("end");
	          }

	          if (entry.tryLoc <= this.prev) {
	            var hasCatch = hasOwn.call(entry, "catchLoc");
	            var hasFinally = hasOwn.call(entry, "finallyLoc");

	            if (hasCatch && hasFinally) {
	              if (this.prev < entry.catchLoc) {
	                return handle(entry.catchLoc, true);
	              } else if (this.prev < entry.finallyLoc) {
	                return handle(entry.finallyLoc);
	              }
	            } else if (hasCatch) {
	              if (this.prev < entry.catchLoc) {
	                return handle(entry.catchLoc, true);
	              }
	            } else if (hasFinally) {
	              if (this.prev < entry.finallyLoc) {
	                return handle(entry.finallyLoc);
	              }
	            } else {
	              throw new Error("try statement without catch or finally");
	            }
	          }
	        }
	      },
	      abrupt: function (type, arg) {
	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];

	          if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
	            var finallyEntry = entry;
	            break;
	          }
	        }

	        if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
	          // Ignore the finally entry if control is not jumping to a
	          // location outside the try/catch block.
	          finallyEntry = null;
	        }

	        var record = finallyEntry ? finallyEntry.completion : {};
	        record.type = type;
	        record.arg = arg;

	        if (finallyEntry) {
	          this.method = "next";
	          this.next = finallyEntry.finallyLoc;
	          return ContinueSentinel;
	        }

	        return this.complete(record);
	      },
	      complete: function (record, afterLoc) {
	        if (record.type === "throw") {
	          throw record.arg;
	        }

	        if (record.type === "break" || record.type === "continue") {
	          this.next = record.arg;
	        } else if (record.type === "return") {
	          this.rval = this.arg = record.arg;
	          this.method = "return";
	          this.next = "end";
	        } else if (record.type === "normal" && afterLoc) {
	          this.next = afterLoc;
	        }

	        return ContinueSentinel;
	      },
	      finish: function (finallyLoc) {
	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];

	          if (entry.finallyLoc === finallyLoc) {
	            this.complete(entry.completion, entry.afterLoc);
	            resetTryEntry(entry);
	            return ContinueSentinel;
	          }
	        }
	      },
	      "catch": function (tryLoc) {
	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];

	          if (entry.tryLoc === tryLoc) {
	            var record = entry.completion;

	            if (record.type === "throw") {
	              var thrown = record.arg;
	              resetTryEntry(entry);
	            }

	            return thrown;
	          }
	        } // The context.catch method must only be called with a location
	        // argument that corresponds to a known catch block.


	        throw new Error("illegal catch attempt");
	      },
	      delegateYield: function (iterable, resultName, nextLoc) {
	        this.delegate = {
	          iterator: values(iterable),
	          resultName: resultName,
	          nextLoc: nextLoc
	        };

	        if (this.method === "next") {
	          // Deliberately forget the last sent value so that we don't
	          // accidentally pass it on to the delegate.
	          this.arg = undefined$1;
	        }

	        return ContinueSentinel;
	      }
	    }; // Regardless of whether this script is executing as a CommonJS module
	    // or not, return the runtime object so that we can declare the variable
	    // regeneratorRuntime in the outer scope, which allows this module to be
	    // injected easily by `bin/regenerator --include-runtime script.js`.

	    return exports;
	  }( // If this script is executing as a CommonJS module, use module.exports
	  // as the regeneratorRuntime namespace. Otherwise create a new empty
	  // object. Either way, the resulting object will be used to initialize
	  // the regeneratorRuntime variable at the top of this file.
	   module.exports );

	  try {
	    regeneratorRuntime = runtime;
	  } catch (accidentalStrictMode) {
	    // This module should not be running in strict mode, so the above
	    // assignment should always work unless something is misconfigured. Just
	    // in case runtime.js accidentally runs in strict mode, we can escape
	    // strict mode using a global Function call. This could conceivably fail
	    // if a Content Security Policy forbids using Function, but in that case
	    // the proper solution is to fix the accidental strict mode problem. If
	    // you've misconfigured your bundler to force strict mode and applied a
	    // CSP to forbid Function, and you're not willing to fix either of those
	    // problems, please detail your unique predicament in a GitHub issue.
	    Function("r", "regeneratorRuntime = r")(runtime);
	  }
	});

	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
	  try {
	    var info = gen[key](arg);
	    var value = info.value;
	  } catch (error) {
	    reject(error);
	    return;
	  }

	  if (info.done) {
	    resolve(value);
	  } else {
	    Promise.resolve(value).then(_next, _throw);
	  }
	}

	function _asyncToGenerator(fn) {
	  return function () {
	    var self = this,
	        args = arguments;
	    return new Promise(function (resolve, reject) {
	      var gen = fn.apply(self, args);

	      function _next(value) {
	        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
	      }

	      function _throw(err) {
	        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
	      }

	      _next(undefined);
	    });
	  };
	}

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  return Constructor;
	}

	function _inherits(subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function");
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) _setPrototypeOf(subClass, superClass);
	}

	function _getPrototypeOf(o) {
	  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
	    return o.__proto__ || Object.getPrototypeOf(o);
	  };
	  return _getPrototypeOf(o);
	}

	function _setPrototypeOf(o, p) {
	  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
	    o.__proto__ = p;
	    return o;
	  };

	  return _setPrototypeOf(o, p);
	}

	function _isNativeReflectConstruct() {
	  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
	  if (Reflect.construct.sham) return false;
	  if (typeof Proxy === "function") return true;

	  try {
	    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
	    return true;
	  } catch (e) {
	    return false;
	  }
	}

	function _assertThisInitialized(self) {
	  if (self === void 0) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return self;
	}

	function _possibleConstructorReturn(self, call) {
	  if (call && (typeof call === "object" || typeof call === "function")) {
	    return call;
	  }

	  return _assertThisInitialized(self);
	}

	function _createSuper(Derived) {
	  return function () {
	    var Super = _getPrototypeOf(Derived),
	        result;

	    if (_isNativeReflectConstruct()) {
	      var NewTarget = _getPrototypeOf(this).constructor;

	      result = Reflect.construct(Super, arguments, NewTarget);
	    } else {
	      result = Super.apply(this, arguments);
	    }

	    return _possibleConstructorReturn(this, result);
	  };
	}

	function _superPropBase(object, property) {
	  while (!Object.prototype.hasOwnProperty.call(object, property)) {
	    object = _getPrototypeOf(object);
	    if (object === null) break;
	  }

	  return object;
	}

	function _get(target, property, receiver) {
	  if (typeof Reflect !== "undefined" && Reflect.get) {
	    _get = Reflect.get;
	  } else {
	    _get = function _get(target, property, receiver) {
	      var base = _superPropBase(target, property);

	      if (!base) return;
	      var desc = Object.getOwnPropertyDescriptor(base, property);

	      if (desc.get) {
	        return desc.get.call(receiver);
	      }

	      return desc.value;
	    };
	  }

	  return _get(target, property, receiver || target);
	}

	function _toConsumableArray(arr) {
	  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
	}

	function _arrayWithoutHoles(arr) {
	  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
	}

	function _iterableToArray(iter) {
	  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
	}

	function _unsupportedIterableToArray(o, minLen) {
	  if (!o) return;
	  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
	  var n = Object.prototype.toString.call(o).slice(8, -1);
	  if (n === "Object" && o.constructor) n = o.constructor.name;
	  if (n === "Map" || n === "Set") return Array.from(n);
	  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
	}

	function _arrayLikeToArray(arr, len) {
	  if (len == null || len > arr.length) len = arr.length;

	  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

	  return arr2;
	}

	function _nonIterableSpread() {
	  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}

	function _createForOfIteratorHelper(o) {
	  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
	    if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) {
	      var i = 0;

	      var F = function () {};

	      return {
	        s: F,
	        n: function () {
	          if (i >= o.length) return {
	            done: true
	          };
	          return {
	            done: false,
	            value: o[i++]
	          };
	        },
	        e: function (e) {
	          throw e;
	        },
	        f: F
	      };
	    }

	    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	  }

	  var it,
	      normalCompletion = true,
	      didErr = false,
	      err;
	  return {
	    s: function () {
	      it = o[Symbol.iterator]();
	    },
	    n: function () {
	      var step = it.next();
	      normalCompletion = step.done;
	      return step;
	    },
	    e: function (e) {
	      didErr = true;
	      err = e;
	    },
	    f: function () {
	      try {
	        if (!normalCompletion && it.return != null) it.return();
	      } finally {
	        if (didErr) throw err;
	      }
	    }
	  };
	}

	var check = function (it) {
	  return it && it.Math == Math && it;
	}; // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028


	var global_1 = // eslint-disable-next-line no-undef
	check(typeof globalThis == 'object' && globalThis) || check(typeof window == 'object' && window) || check(typeof self == 'object' && self) || check(typeof commonjsGlobal == 'object' && commonjsGlobal) || // eslint-disable-next-line no-new-func
	Function('return this')();

	var fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	var descriptors = !fails(function () {
	  return Object.defineProperty({}, 1, {
	    get: function () {
	      return 7;
	    }
	  })[1] != 7;
	});

	var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // Nashorn ~ JDK8 bug

	var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({
	  1: 2
	}, 1); // `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable

	var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : nativePropertyIsEnumerable;
	var objectPropertyIsEnumerable = {
	  f: f
	};

	var createPropertyDescriptor = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var toString = {}.toString;

	var classofRaw = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	var split = ''.split; // fallback for non-array-like ES3 and non-enumerable old V8 strings

	var indexedObject = fails(function () {
	  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	  // eslint-disable-next-line no-prototype-builtins
	  return !Object('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
	} : Object;

	// `RequireObjectCoercible` abstract operation
	// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on " + it);
	  return it;
	};

	var toIndexedObject = function (it) {
	  return indexedObject(requireObjectCoercible(it));
	};

	var isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	// https://tc39.github.io/ecma262/#sec-toprimitive
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string

	var toPrimitive = function (input, PREFERRED_STRING) {
	  if (!isObject(input)) return input;
	  var fn, val;
	  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var hasOwnProperty = {}.hasOwnProperty;

	var has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var document$1 = global_1.document; // typeof document.createElement is 'object' in old IE

	var EXISTS = isObject(document$1) && isObject(document$1.createElement);

	var documentCreateElement = function (it) {
	  return EXISTS ? document$1.createElement(it) : {};
	};

	var ie8DomDefine = !descriptors && !fails(function () {
	  return Object.defineProperty(documentCreateElement('div'), 'a', {
	    get: function () {
	      return 7;
	    }
	  }).a != 7;
	});

	var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // `Object.getOwnPropertyDescriptor` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor

	var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject(O);
	  P = toPrimitive(P, true);
	  if (ie8DomDefine) try {
	    return nativeGetOwnPropertyDescriptor(O, P);
	  } catch (error) {
	    /* empty */
	  }
	  if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
	};
	var objectGetOwnPropertyDescriptor = {
	  f: f$1
	};

	var anObject = function (it) {
	  if (!isObject(it)) {
	    throw TypeError(String(it) + ' is not an object');
	  }

	  return it;
	};

	var nativeDefineProperty = Object.defineProperty; // `Object.defineProperty` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperty

	var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if (ie8DomDefine) try {
	    return nativeDefineProperty(O, P, Attributes);
	  } catch (error) {
	    /* empty */
	  }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};
	var objectDefineProperty = {
	  f: f$2
	};

	var createNonEnumerableProperty = descriptors ? function (object, key, value) {
	  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var setGlobal = function (key, value) {
	  try {
	    createNonEnumerableProperty(global_1, key, value);
	  } catch (error) {
	    global_1[key] = value;
	  }

	  return value;
	};

	var SHARED = '__core-js_shared__';
	var store = global_1[SHARED] || setGlobal(SHARED, {});
	var sharedStore = store;

	var functionToString = Function.toString; // this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper

	if (typeof sharedStore.inspectSource != 'function') {
	  sharedStore.inspectSource = function (it) {
	    return functionToString.call(it);
	  };
	}

	var inspectSource = sharedStore.inspectSource;

	var WeakMap = global_1.WeakMap;
	var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

	var isPure = false;

	var shared = createCommonjsModule(function (module) {
	  (module.exports = function (key, value) {
	    return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
	  })('versions', []).push({
	    version: '3.6.4',
	    mode:  'global',
	    copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
	  });
	});

	var id = 0;
	var postfix = Math.random();

	var uid = function (key) {
	  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
	};

	var keys = shared('keys');

	var sharedKey = function (key) {
	  return keys[key] || (keys[key] = uid(key));
	};

	var hiddenKeys = {};

	var WeakMap$1 = global_1.WeakMap;
	var set, get, has$1;

	var enforce = function (it) {
	  return has$1(it) ? get(it) : set(it, {});
	};

	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;

	    if (!isObject(it) || (state = get(it)).type !== TYPE) {
	      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
	    }

	    return state;
	  };
	};

	if (nativeWeakMap) {
	  var store$1 = new WeakMap$1();
	  var wmget = store$1.get;
	  var wmhas = store$1.has;
	  var wmset = store$1.set;

	  set = function (it, metadata) {
	    wmset.call(store$1, it, metadata);
	    return metadata;
	  };

	  get = function (it) {
	    return wmget.call(store$1, it) || {};
	  };

	  has$1 = function (it) {
	    return wmhas.call(store$1, it);
	  };
	} else {
	  var STATE = sharedKey('state');
	  hiddenKeys[STATE] = true;

	  set = function (it, metadata) {
	    createNonEnumerableProperty(it, STATE, metadata);
	    return metadata;
	  };

	  get = function (it) {
	    return has(it, STATE) ? it[STATE] : {};
	  };

	  has$1 = function (it) {
	    return has(it, STATE);
	  };
	}

	var internalState = {
	  set: set,
	  get: get,
	  has: has$1,
	  enforce: enforce,
	  getterFor: getterFor
	};

	var redefine = createCommonjsModule(function (module) {
	  var getInternalState = internalState.get;
	  var enforceInternalState = internalState.enforce;
	  var TEMPLATE = String(String).split('String');
	  (module.exports = function (O, key, value, options) {
	    var unsafe = options ? !!options.unsafe : false;
	    var simple = options ? !!options.enumerable : false;
	    var noTargetGet = options ? !!options.noTargetGet : false;

	    if (typeof value == 'function') {
	      if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
	      enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
	    }

	    if (O === global_1) {
	      if (simple) O[key] = value;else setGlobal(key, value);
	      return;
	    } else if (!unsafe) {
	      delete O[key];
	    } else if (!noTargetGet && O[key]) {
	      simple = true;
	    }

	    if (simple) O[key] = value;else createNonEnumerableProperty(O, key, value); // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	  })(Function.prototype, 'toString', function toString() {
	    return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
	  });
	});

	var path = global_1;

	var aFunction = function (variable) {
	  return typeof variable == 'function' ? variable : undefined;
	};

	var getBuiltIn = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace]) : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
	};

	var ceil = Math.ceil;
	var floor = Math.floor; // `ToInteger` abstract operation
	// https://tc39.github.io/ecma262/#sec-tointeger

	var toInteger = function (argument) {
	  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
	};

	var min = Math.min; // `ToLength` abstract operation
	// https://tc39.github.io/ecma262/#sec-tolength

	var toLength = function (argument) {
	  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var max = Math.max;
	var min$1 = Math.min; // Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).

	var toAbsoluteIndex = function (index, length) {
	  var integer = toInteger(index);
	  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
	};

	var createMethod = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject($this);
	    var length = toLength(O.length);
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value; // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare

	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++]; // eslint-disable-next-line no-self-compare

	      if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
	    } else for (; length > index; index++) {
	      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
	    }
	    return !IS_INCLUDES && -1;
	  };
	};

	var arrayIncludes = {
	  // `Array.prototype.includes` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
	  includes: createMethod(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod(false)
	};

	var indexOf = arrayIncludes.indexOf;

	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject(object);
	  var i = 0;
	  var result = [];
	  var key;

	  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key); // Don't enum bug & hidden keys


	  while (names.length > i) if (has(O, key = names[i++])) {
	    ~indexOf(result, key) || result.push(key);
	  }

	  return result;
	};

	// IE8- don't enum bug keys
	var enumBugKeys = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

	var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype'); // `Object.getOwnPropertyNames` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertynames

	var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return objectKeysInternal(O, hiddenKeys$1);
	};

	var objectGetOwnPropertyNames = {
	  f: f$3
	};

	var f$4 = Object.getOwnPropertySymbols;
	var objectGetOwnPropertySymbols = {
	  f: f$4
	};

	var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
	  var keys = objectGetOwnPropertyNames.f(anObject(it));
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
	};

	var copyConstructorProperties = function (target, source) {
	  var keys = ownKeys(source);
	  var defineProperty = objectDefineProperty.f;
	  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;

	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	  }
	};

	var replacement = /#|\.prototype\./;

	var isForced = function (feature, detection) {
	  var value = data[normalize(feature)];
	  return value == POLYFILL ? true : value == NATIVE ? false : typeof detection == 'function' ? fails(detection) : !!detection;
	};

	var normalize = isForced.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};

	var data = isForced.data = {};
	var NATIVE = isForced.NATIVE = 'N';
	var POLYFILL = isForced.POLYFILL = 'P';
	var isForced_1 = isForced;

	var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
	/*
	  options.target      - name of the target object
	  options.global      - target is the global object
	  options.stat        - export as static methods of target
	  options.proto       - export as prototype methods of target
	  options.real        - real prototype method for the `pure` version
	  options.forced      - export even if the native feature is available
	  options.bind        - bind methods to the target, required for the `pure` version
	  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
	  options.sham        - add a flag to not completely full polyfills
	  options.enumerable  - export as enumerable property
	  options.noTargetGet - prevent calling a getter on target
	*/

	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var FORCED, target, key, targetProperty, sourceProperty, descriptor;

	  if (GLOBAL) {
	    target = global_1;
	  } else if (STATIC) {
	    target = global_1[TARGET] || setGlobal(TARGET, {});
	  } else {
	    target = (global_1[TARGET] || {}).prototype;
	  }

	  if (target) for (key in source) {
	    sourceProperty = source[key];

	    if (options.noTargetGet) {
	      descriptor = getOwnPropertyDescriptor$1(target, key);
	      targetProperty = descriptor && descriptor.value;
	    } else targetProperty = target[key];

	    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced); // contained in target

	    if (!FORCED && targetProperty !== undefined) {
	      if (typeof sourceProperty === typeof targetProperty) continue;
	      copyConstructorProperties(sourceProperty, targetProperty);
	    } // add a flag to not completely full polyfills


	    if (options.sham || targetProperty && targetProperty.sham) {
	      createNonEnumerableProperty(sourceProperty, 'sham', true);
	    } // extend global


	    redefine(target, key, sourceProperty, options);
	  }
	};

	var arrayMethodIsStrict = function (METHOD_NAME, argument) {
	  var method = [][METHOD_NAME];
	  return !!method && fails(function () {
	    // eslint-disable-next-line no-useless-call,no-throw-literal
	    method.call(null, argument || function () {
	      throw 1;
	    }, 1);
	  });
	};

	var nativeJoin = [].join;
	var ES3_STRINGS = indexedObject != Object;
	var STRICT_METHOD = arrayMethodIsStrict('join', ','); // `Array.prototype.join` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.join

	_export({
	  target: 'Array',
	  proto: true,
	  forced: ES3_STRINGS || !STRICT_METHOD
	}, {
	  join: function join(separator) {
	    return nativeJoin.call(toIndexedObject(this), separator === undefined ? ',' : separator);
	  }
	});

	var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
	  // Chrome 38 Symbol has incorrect toString conversion
	  // eslint-disable-next-line no-undef
	  return !String(Symbol());
	});

	var useSymbolAsUid = nativeSymbol // eslint-disable-next-line no-undef
	&& !Symbol.sham // eslint-disable-next-line no-undef
	&& typeof Symbol.iterator == 'symbol';

	var WellKnownSymbolsStore = shared('wks');
	var Symbol$1 = global_1.Symbol;
	var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

	var wellKnownSymbol = function (name) {
	  if (!has(WellKnownSymbolsStore, name)) {
	    if (nativeSymbol && has(Symbol$1, name)) WellKnownSymbolsStore[name] = Symbol$1[name];else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
	  }

	  return WellKnownSymbolsStore[name];
	};

	var TO_STRING_TAG = wellKnownSymbol('toStringTag');
	var test = {};
	test[TO_STRING_TAG] = 'z';
	var toStringTagSupport = String(test) === '[object z]';

	var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag'); // ES3 wrong here

	var CORRECT_ARGUMENTS = classofRaw(function () {
	  return arguments;
	}()) == 'Arguments'; // fallback for IE11 Script Access Denied error

	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (error) {
	    /* empty */
	  }
	}; // getting tag from ES6+ `Object.prototype.toString`


	var classof = toStringTagSupport ? classofRaw : function (it) {
	  var O, tag, result;
	  return it === undefined ? 'Undefined' : it === null ? 'Null' // @@toStringTag case
	  : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$1)) == 'string' ? tag // builtinTag case
	  : CORRECT_ARGUMENTS ? classofRaw(O) // ES3 arguments fallback
	  : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
	};

	// https://tc39.github.io/ecma262/#sec-object.prototype.tostring


	var objectToString = toStringTagSupport ? {}.toString : function toString() {
	  return '[object ' + classof(this) + ']';
	};

	// https://tc39.github.io/ecma262/#sec-object.prototype.tostring

	if (!toStringTagSupport) {
	  redefine(Object.prototype, 'toString', objectToString, {
	    unsafe: true
	  });
	}

	var nativePromiseConstructor = global_1.Promise;

	var redefineAll = function (target, src, options) {
	  for (var key in src) redefine(target, key, src[key], options);

	  return target;
	};

	var defineProperty = objectDefineProperty.f;
	var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');

	var setToStringTag = function (it, TAG, STATIC) {
	  if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG$2)) {
	    defineProperty(it, TO_STRING_TAG$2, {
	      configurable: true,
	      value: TAG
	    });
	  }
	};

	var SPECIES = wellKnownSymbol('species');

	var setSpecies = function (CONSTRUCTOR_NAME) {
	  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
	  var defineProperty = objectDefineProperty.f;

	  if (descriptors && Constructor && !Constructor[SPECIES]) {
	    defineProperty(Constructor, SPECIES, {
	      configurable: true,
	      get: function () {
	        return this;
	      }
	    });
	  }
	};

	var aFunction$1 = function (it) {
	  if (typeof it != 'function') {
	    throw TypeError(String(it) + ' is not a function');
	  }

	  return it;
	};

	var anInstance = function (it, Constructor, name) {
	  if (!(it instanceof Constructor)) {
	    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
	  }

	  return it;
	};

	var iterators = {};

	var ITERATOR = wellKnownSymbol('iterator');
	var ArrayPrototype = Array.prototype; // check on default Array iterator

	var isArrayIteratorMethod = function (it) {
	  return it !== undefined && (iterators.Array === it || ArrayPrototype[ITERATOR] === it);
	};

	var functionBindContext = function (fn, that, length) {
	  aFunction$1(fn);
	  if (that === undefined) return fn;

	  switch (length) {
	    case 0:
	      return function () {
	        return fn.call(that);
	      };

	    case 1:
	      return function (a) {
	        return fn.call(that, a);
	      };

	    case 2:
	      return function (a, b) {
	        return fn.call(that, a, b);
	      };

	    case 3:
	      return function (a, b, c) {
	        return fn.call(that, a, b, c);
	      };
	  }

	  return function ()
	  /* ...args */
	  {
	    return fn.apply(that, arguments);
	  };
	};

	var ITERATOR$1 = wellKnownSymbol('iterator');

	var getIteratorMethod = function (it) {
	  if (it != undefined) return it[ITERATOR$1] || it['@@iterator'] || iterators[classof(it)];
	};

	var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
	  try {
	    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value); // 7.4.6 IteratorClose(iterator, completion)
	  } catch (error) {
	    var returnMethod = iterator['return'];
	    if (returnMethod !== undefined) anObject(returnMethod.call(iterator));
	    throw error;
	  }
	};

	var iterate_1 = createCommonjsModule(function (module) {
	  var Result = function (stopped, result) {
	    this.stopped = stopped;
	    this.result = result;
	  };

	  var iterate = module.exports = function (iterable, fn, that, AS_ENTRIES, IS_ITERATOR) {
	    var boundFunction = functionBindContext(fn, that, AS_ENTRIES ? 2 : 1);
	    var iterator, iterFn, index, length, result, next, step;

	    if (IS_ITERATOR) {
	      iterator = iterable;
	    } else {
	      iterFn = getIteratorMethod(iterable);
	      if (typeof iterFn != 'function') throw TypeError('Target is not iterable'); // optimisation for array iterators

	      if (isArrayIteratorMethod(iterFn)) {
	        for (index = 0, length = toLength(iterable.length); length > index; index++) {
	          result = AS_ENTRIES ? boundFunction(anObject(step = iterable[index])[0], step[1]) : boundFunction(iterable[index]);
	          if (result && result instanceof Result) return result;
	        }

	        return new Result(false);
	      }

	      iterator = iterFn.call(iterable);
	    }

	    next = iterator.next;

	    while (!(step = next.call(iterator)).done) {
	      result = callWithSafeIterationClosing(iterator, boundFunction, step.value, AS_ENTRIES);
	      if (typeof result == 'object' && result && result instanceof Result) return result;
	    }

	    return new Result(false);
	  };

	  iterate.stop = function (result) {
	    return new Result(true, result);
	  };
	});

	var ITERATOR$2 = wellKnownSymbol('iterator');
	var SAFE_CLOSING = false;

	try {
	  var called = 0;
	  var iteratorWithReturn = {
	    next: function () {
	      return {
	        done: !!called++
	      };
	    },
	    'return': function () {
	      SAFE_CLOSING = true;
	    }
	  };

	  iteratorWithReturn[ITERATOR$2] = function () {
	    return this;
	  }; // eslint-disable-next-line no-throw-literal


	  Array.from(iteratorWithReturn, function () {
	    throw 2;
	  });
	} catch (error) {
	  /* empty */
	}

	var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
	  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
	  var ITERATION_SUPPORT = false;

	  try {
	    var object = {};

	    object[ITERATOR$2] = function () {
	      return {
	        next: function () {
	          return {
	            done: ITERATION_SUPPORT = true
	          };
	        }
	      };
	    };

	    exec(object);
	  } catch (error) {
	    /* empty */
	  }

	  return ITERATION_SUPPORT;
	};

	var SPECIES$1 = wellKnownSymbol('species'); // `SpeciesConstructor` abstract operation
	// https://tc39.github.io/ecma262/#sec-speciesconstructor

	var speciesConstructor = function (O, defaultConstructor) {
	  var C = anObject(O).constructor;
	  var S;
	  return C === undefined || (S = anObject(C)[SPECIES$1]) == undefined ? defaultConstructor : aFunction$1(S);
	};

	var html = getBuiltIn('document', 'documentElement');

	var engineUserAgent = getBuiltIn('navigator', 'userAgent') || '';

	var engineIsIos = /(iphone|ipod|ipad).*applewebkit/i.test(engineUserAgent);

	var location = global_1.location;
	var set$1 = global_1.setImmediate;
	var clear = global_1.clearImmediate;
	var process = global_1.process;
	var MessageChannel = global_1.MessageChannel;
	var Dispatch = global_1.Dispatch;
	var counter = 0;
	var queue = {};
	var ONREADYSTATECHANGE = 'onreadystatechange';
	var defer, channel, port;

	var run = function (id) {
	  // eslint-disable-next-line no-prototype-builtins
	  if (queue.hasOwnProperty(id)) {
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};

	var runner = function (id) {
	  return function () {
	    run(id);
	  };
	};

	var listener = function (event) {
	  run(event.data);
	};

	var post = function (id) {
	  // old engines have not location.origin
	  global_1.postMessage(id + '', location.protocol + '//' + location.host);
	}; // Node.js 0.9+ & IE10+ has setImmediate, otherwise:


	if (!set$1 || !clear) {
	  set$1 = function setImmediate(fn) {
	    var args = [];
	    var i = 1;

	    while (arguments.length > i) args.push(arguments[i++]);

	    queue[++counter] = function () {
	      // eslint-disable-next-line no-new-func
	      (typeof fn == 'function' ? fn : Function(fn)).apply(undefined, args);
	    };

	    defer(counter);
	    return counter;
	  };

	  clear = function clearImmediate(id) {
	    delete queue[id];
	  }; // Node.js 0.8-


	  if (classofRaw(process) == 'process') {
	    defer = function (id) {
	      process.nextTick(runner(id));
	    }; // Sphere (JS game engine) Dispatch API

	  } else if (Dispatch && Dispatch.now) {
	    defer = function (id) {
	      Dispatch.now(runner(id));
	    }; // Browsers with MessageChannel, includes WebWorkers
	    // except iOS - https://github.com/zloirock/core-js/issues/624

	  } else if (MessageChannel && !engineIsIos) {
	    channel = new MessageChannel();
	    port = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = functionBindContext(port.postMessage, port, 1); // Browsers with postMessage, skip WebWorkers
	    // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if (global_1.addEventListener && typeof postMessage == 'function' && !global_1.importScripts && !fails(post)) {
	    defer = post;
	    global_1.addEventListener('message', listener, false); // IE8-
	  } else if (ONREADYSTATECHANGE in documentCreateElement('script')) {
	    defer = function (id) {
	      html.appendChild(documentCreateElement('script'))[ONREADYSTATECHANGE] = function () {
	        html.removeChild(this);
	        run(id);
	      };
	    }; // Rest old browsers

	  } else {
	    defer = function (id) {
	      setTimeout(runner(id), 0);
	    };
	  }
	}

	var task = {
	  set: set$1,
	  clear: clear
	};

	var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;
	var macrotask = task.set;
	var MutationObserver = global_1.MutationObserver || global_1.WebKitMutationObserver;
	var process$1 = global_1.process;
	var Promise$1 = global_1.Promise;
	var IS_NODE = classofRaw(process$1) == 'process'; // Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`

	var queueMicrotaskDescriptor = getOwnPropertyDescriptor$2(global_1, 'queueMicrotask');
	var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;
	var flush, head, last, notify, toggle, node, promise, then; // modern engines have queueMicrotask method

	if (!queueMicrotask) {
	  flush = function () {
	    var parent, fn;
	    if (IS_NODE && (parent = process$1.domain)) parent.exit();

	    while (head) {
	      fn = head.fn;
	      head = head.next;

	      try {
	        fn();
	      } catch (error) {
	        if (head) notify();else last = undefined;
	        throw error;
	      }
	    }

	    last = undefined;
	    if (parent) parent.enter();
	  }; // Node.js


	  if (IS_NODE) {
	    notify = function () {
	      process$1.nextTick(flush);
	    }; // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339

	  } else if (MutationObserver && !engineIsIos) {
	    toggle = true;
	    node = document.createTextNode('');
	    new MutationObserver(flush).observe(node, {
	      characterData: true
	    });

	    notify = function () {
	      node.data = toggle = !toggle;
	    }; // environments with maybe non-completely correct, but existent Promise

	  } else if (Promise$1 && Promise$1.resolve) {
	    // Promise.resolve without an argument throws an error in LG WebOS 2
	    promise = Promise$1.resolve(undefined);
	    then = promise.then;

	    notify = function () {
	      then.call(promise, flush);
	    }; // for other environments - macrotask based on:
	    // - setImmediate
	    // - MessageChannel
	    // - window.postMessag
	    // - onreadystatechange
	    // - setTimeout

	  } else {
	    notify = function () {
	      // strange IE + webpack dev server bug - use .call(global)
	      macrotask.call(global_1, flush);
	    };
	  }
	}

	var microtask = queueMicrotask || function (fn) {
	  var task = {
	    fn: fn,
	    next: undefined
	  };
	  if (last) last.next = task;

	  if (!head) {
	    head = task;
	    notify();
	  }

	  last = task;
	};

	var PromiseCapability = function (C) {
	  var resolve, reject;
	  this.promise = new C(function ($$resolve, $$reject) {
	    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject = $$reject;
	  });
	  this.resolve = aFunction$1(resolve);
	  this.reject = aFunction$1(reject);
	}; // 25.4.1.5 NewPromiseCapability(C)


	var f$5 = function (C) {
	  return new PromiseCapability(C);
	};

	var newPromiseCapability = {
	  f: f$5
	};

	var promiseResolve = function (C, x) {
	  anObject(C);
	  if (isObject(x) && x.constructor === C) return x;
	  var promiseCapability = newPromiseCapability.f(C);
	  var resolve = promiseCapability.resolve;
	  resolve(x);
	  return promiseCapability.promise;
	};

	var hostReportErrors = function (a, b) {
	  var console = global_1.console;

	  if (console && console.error) {
	    arguments.length === 1 ? console.error(a) : console.error(a, b);
	  }
	};

	var perform = function (exec) {
	  try {
	    return {
	      error: false,
	      value: exec()
	    };
	  } catch (error) {
	    return {
	      error: true,
	      value: error
	    };
	  }
	};

	var process$2 = global_1.process;
	var versions = process$2 && process$2.versions;
	var v8 = versions && versions.v8;
	var match, version;

	if (v8) {
	  match = v8.split('.');
	  version = match[0] + match[1];
	} else if (engineUserAgent) {
	  match = engineUserAgent.match(/Edge\/(\d+)/);

	  if (!match || match[1] >= 74) {
	    match = engineUserAgent.match(/Chrome\/(\d+)/);
	    if (match) version = match[1];
	  }
	}

	var engineV8Version = version && +version;

	var task$1 = task.set;
	var SPECIES$2 = wellKnownSymbol('species');
	var PROMISE = 'Promise';
	var getInternalState = internalState.get;
	var setInternalState = internalState.set;
	var getInternalPromiseState = internalState.getterFor(PROMISE);
	var PromiseConstructor = nativePromiseConstructor;
	var TypeError$1 = global_1.TypeError;
	var document$2 = global_1.document;
	var process$3 = global_1.process;
	var $fetch = getBuiltIn('fetch');
	var newPromiseCapability$1 = newPromiseCapability.f;
	var newGenericPromiseCapability = newPromiseCapability$1;
	var IS_NODE$1 = classofRaw(process$3) == 'process';
	var DISPATCH_EVENT = !!(document$2 && document$2.createEvent && global_1.dispatchEvent);
	var UNHANDLED_REJECTION = 'unhandledrejection';
	var REJECTION_HANDLED = 'rejectionhandled';
	var PENDING = 0;
	var FULFILLED = 1;
	var REJECTED = 2;
	var HANDLED = 1;
	var UNHANDLED = 2;
	var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;
	var FORCED = isForced_1(PROMISE, function () {
	  var GLOBAL_CORE_JS_PROMISE = inspectSource(PromiseConstructor) !== String(PromiseConstructor);

	  if (!GLOBAL_CORE_JS_PROMISE) {
	    // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
	    // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
	    // We can't detect it synchronously, so just check versions
	    if (engineV8Version === 66) return true; // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test

	    if (!IS_NODE$1 && typeof PromiseRejectionEvent != 'function') return true;
	  } // We need Promise#finally in the pure version for preventing prototype pollution
	  // deoptimization and performance degradation
	  // https://github.com/zloirock/core-js/issues/679

	  if (engineV8Version >= 51 && /native code/.test(PromiseConstructor)) return false; // Detect correctness of subclassing with @@species support

	  var promise = PromiseConstructor.resolve(1);

	  var FakePromise = function (exec) {
	    exec(function () {
	      /* empty */
	    }, function () {
	      /* empty */
	    });
	  };

	  var constructor = promise.constructor = {};
	  constructor[SPECIES$2] = FakePromise;
	  return !(promise.then(function () {
	    /* empty */
	  }) instanceof FakePromise);
	});
	var INCORRECT_ITERATION = FORCED || !checkCorrectnessOfIteration(function (iterable) {
	  PromiseConstructor.all(iterable)['catch'](function () {
	    /* empty */
	  });
	}); // helpers

	var isThenable = function (it) {
	  var then;
	  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};

	var notify$1 = function (promise, state, isReject) {
	  if (state.notified) return;
	  state.notified = true;
	  var chain = state.reactions;
	  microtask(function () {
	    var value = state.value;
	    var ok = state.state == FULFILLED;
	    var index = 0; // variable length - can't use forEach

	    while (chain.length > index) {
	      var reaction = chain[index++];
	      var handler = ok ? reaction.ok : reaction.fail;
	      var resolve = reaction.resolve;
	      var reject = reaction.reject;
	      var domain = reaction.domain;
	      var result, then, exited;

	      try {
	        if (handler) {
	          if (!ok) {
	            if (state.rejection === UNHANDLED) onHandleUnhandled(promise, state);
	            state.rejection = HANDLED;
	          }

	          if (handler === true) result = value;else {
	            if (domain) domain.enter();
	            result = handler(value); // can throw

	            if (domain) {
	              domain.exit();
	              exited = true;
	            }
	          }

	          if (result === reaction.promise) {
	            reject(TypeError$1('Promise-chain cycle'));
	          } else if (then = isThenable(result)) {
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch (error) {
	        if (domain && !exited) domain.exit();
	        reject(error);
	      }
	    }

	    state.reactions = [];
	    state.notified = false;
	    if (isReject && !state.rejection) onUnhandled(promise, state);
	  });
	};

	var dispatchEvent = function (name, promise, reason) {
	  var event, handler;

	  if (DISPATCH_EVENT) {
	    event = document$2.createEvent('Event');
	    event.promise = promise;
	    event.reason = reason;
	    event.initEvent(name, false, true);
	    global_1.dispatchEvent(event);
	  } else event = {
	    promise: promise,
	    reason: reason
	  };

	  if (handler = global_1['on' + name]) handler(event);else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
	};

	var onUnhandled = function (promise, state) {
	  task$1.call(global_1, function () {
	    var value = state.value;
	    var IS_UNHANDLED = isUnhandled(state);
	    var result;

	    if (IS_UNHANDLED) {
	      result = perform(function () {
	        if (IS_NODE$1) {
	          process$3.emit('unhandledRejection', value, promise);
	        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
	      }); // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should

	      state.rejection = IS_NODE$1 || isUnhandled(state) ? UNHANDLED : HANDLED;
	      if (result.error) throw result.value;
	    }
	  });
	};

	var isUnhandled = function (state) {
	  return state.rejection !== HANDLED && !state.parent;
	};

	var onHandleUnhandled = function (promise, state) {
	  task$1.call(global_1, function () {
	    if (IS_NODE$1) {
	      process$3.emit('rejectionHandled', promise);
	    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
	  });
	};

	var bind = function (fn, promise, state, unwrap) {
	  return function (value) {
	    fn(promise, state, value, unwrap);
	  };
	};

	var internalReject = function (promise, state, value, unwrap) {
	  if (state.done) return;
	  state.done = true;
	  if (unwrap) state = unwrap;
	  state.value = value;
	  state.state = REJECTED;
	  notify$1(promise, state, true);
	};

	var internalResolve = function (promise, state, value, unwrap) {
	  if (state.done) return;
	  state.done = true;
	  if (unwrap) state = unwrap;

	  try {
	    if (promise === value) throw TypeError$1("Promise can't be resolved itself");
	    var then = isThenable(value);

	    if (then) {
	      microtask(function () {
	        var wrapper = {
	          done: false
	        };

	        try {
	          then.call(value, bind(internalResolve, promise, wrapper, state), bind(internalReject, promise, wrapper, state));
	        } catch (error) {
	          internalReject(promise, wrapper, error, state);
	        }
	      });
	    } else {
	      state.value = value;
	      state.state = FULFILLED;
	      notify$1(promise, state, false);
	    }
	  } catch (error) {
	    internalReject(promise, {
	      done: false
	    }, error, state);
	  }
	}; // constructor polyfill


	if (FORCED) {
	  // 25.4.3.1 Promise(executor)
	  PromiseConstructor = function Promise(executor) {
	    anInstance(this, PromiseConstructor, PROMISE);
	    aFunction$1(executor);
	    Internal.call(this);
	    var state = getInternalState(this);

	    try {
	      executor(bind(internalResolve, this, state), bind(internalReject, this, state));
	    } catch (error) {
	      internalReject(this, state, error);
	    }
	  }; // eslint-disable-next-line no-unused-vars


	  Internal = function Promise(executor) {
	    setInternalState(this, {
	      type: PROMISE,
	      done: false,
	      notified: false,
	      parent: false,
	      reactions: [],
	      rejection: false,
	      state: PENDING,
	      value: undefined
	    });
	  };

	  Internal.prototype = redefineAll(PromiseConstructor.prototype, {
	    // `Promise.prototype.then` method
	    // https://tc39.github.io/ecma262/#sec-promise.prototype.then
	    then: function then(onFulfilled, onRejected) {
	      var state = getInternalPromiseState(this);
	      var reaction = newPromiseCapability$1(speciesConstructor(this, PromiseConstructor));
	      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail = typeof onRejected == 'function' && onRejected;
	      reaction.domain = IS_NODE$1 ? process$3.domain : undefined;
	      state.parent = true;
	      state.reactions.push(reaction);
	      if (state.state != PENDING) notify$1(this, state, false);
	      return reaction.promise;
	    },
	    // `Promise.prototype.catch` method
	    // https://tc39.github.io/ecma262/#sec-promise.prototype.catch
	    'catch': function (onRejected) {
	      return this.then(undefined, onRejected);
	    }
	  });

	  OwnPromiseCapability = function () {
	    var promise = new Internal();
	    var state = getInternalState(promise);
	    this.promise = promise;
	    this.resolve = bind(internalResolve, promise, state);
	    this.reject = bind(internalReject, promise, state);
	  };

	  newPromiseCapability.f = newPromiseCapability$1 = function (C) {
	    return C === PromiseConstructor || C === PromiseWrapper ? new OwnPromiseCapability(C) : newGenericPromiseCapability(C);
	  };

	  if ( typeof nativePromiseConstructor == 'function') {
	    nativeThen = nativePromiseConstructor.prototype.then; // wrap native Promise#then for native async functions

	    redefine(nativePromiseConstructor.prototype, 'then', function then(onFulfilled, onRejected) {
	      var that = this;
	      return new PromiseConstructor(function (resolve, reject) {
	        nativeThen.call(that, resolve, reject);
	      }).then(onFulfilled, onRejected); // https://github.com/zloirock/core-js/issues/640
	    }, {
	      unsafe: true
	    }); // wrap fetch result

	    if (typeof $fetch == 'function') _export({
	      global: true,
	      enumerable: true,
	      forced: true
	    }, {
	      // eslint-disable-next-line no-unused-vars
	      fetch: function fetch(input
	      /* , init */
	      ) {
	        return promiseResolve(PromiseConstructor, $fetch.apply(global_1, arguments));
	      }
	    });
	  }
	}

	_export({
	  global: true,
	  wrap: true,
	  forced: FORCED
	}, {
	  Promise: PromiseConstructor
	});
	setToStringTag(PromiseConstructor, PROMISE, false);
	setSpecies(PROMISE);
	PromiseWrapper = getBuiltIn(PROMISE); // statics

	_export({
	  target: PROMISE,
	  stat: true,
	  forced: FORCED
	}, {
	  // `Promise.reject` method
	  // https://tc39.github.io/ecma262/#sec-promise.reject
	  reject: function reject(r) {
	    var capability = newPromiseCapability$1(this);
	    capability.reject.call(undefined, r);
	    return capability.promise;
	  }
	});
	_export({
	  target: PROMISE,
	  stat: true,
	  forced:  FORCED
	}, {
	  // `Promise.resolve` method
	  // https://tc39.github.io/ecma262/#sec-promise.resolve
	  resolve: function resolve(x) {
	    return promiseResolve( this, x);
	  }
	});
	_export({
	  target: PROMISE,
	  stat: true,
	  forced: INCORRECT_ITERATION
	}, {
	  // `Promise.all` method
	  // https://tc39.github.io/ecma262/#sec-promise.all
	  all: function all(iterable) {
	    var C = this;
	    var capability = newPromiseCapability$1(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform(function () {
	      var $promiseResolve = aFunction$1(C.resolve);
	      var values = [];
	      var counter = 0;
	      var remaining = 1;
	      iterate_1(iterable, function (promise) {
	        var index = counter++;
	        var alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        $promiseResolve.call(C, promise).then(function (value) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  },
	  // `Promise.race` method
	  // https://tc39.github.io/ecma262/#sec-promise.race
	  race: function race(iterable) {
	    var C = this;
	    var capability = newPromiseCapability$1(C);
	    var reject = capability.reject;
	    var result = perform(function () {
	      var $promiseResolve = aFunction$1(C.resolve);
	      iterate_1(iterable, function (promise) {
	        $promiseResolve.call(C, promise).then(capability.resolve, reject);
	      });
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  }
	});

	var picker;

	function init(clientId) {
	  var scope, config;
	  scope = ['https://www.googleapis.com/auth/devstorage.read_only', 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/drive.readonly'];
	  config = {
	    'clientId': clientId,
	    'scope': scope.join(' ')
	  };
	  return gapi.client.init(config);
	}

	function postInit() {
	  var callback, onerror, config;
	  gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);

	  callback = function callback() {};

	  onerror = function onerror() {
	    alert('Error loading Google Picker library');
	  };

	  config = {
	    callback: callback,
	    onerror: onerror
	  };
	  gapi.load('picker', config);
	}

	function createDropdownButtonPicker(multipleFileSelection, filePickerHandler) {
	  getAccessToken().then(function (accessToken) {
	    return accessToken;
	  }).then(function (accessToken) {
	    var view, teamView;
	    view = new google.picker.DocsView(google.picker.ViewId.DOCS);
	    view.setIncludeFolders(true);
	    teamView = new google.picker.DocsView(google.picker.ViewId.DOCS);
	    teamView.setEnableTeamDrives(true);
	    teamView.setIncludeFolders(true);

	    if (accessToken) {
	      if (multipleFileSelection) {
	        picker = new google.picker.PickerBuilder().enableFeature(google.picker.Feature.MULTISELECT_ENABLED).setOAuthToken(igv.oauth.google.access_token).addView(view).addView(teamView).enableFeature(google.picker.Feature.SUPPORT_TEAM_DRIVES).setCallback(function (data) {
	          if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
	            filePickerHandler(data[google.picker.Response.DOCUMENTS]);
	          }
	        }).build();
	      } else {
	        picker = new google.picker.PickerBuilder().disableFeature(google.picker.Feature.MULTISELECT_ENABLED).setOAuthToken(igv.oauth.google.access_token).addView(view).addView(teamView).enableFeature(google.picker.Feature.SUPPORT_TEAM_DRIVES).setCallback(function (data) {
	          if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
	            filePickerHandler(data[google.picker.Response.DOCUMENTS]);
	          }
	        }).build();
	      }

	      picker.setVisible(true);
	    } else {
	      alertPanel.presentAlert("Sign into Google before using picker");
	    }
	  }).catch(function (error) {});
	}

	function signInHandler() {
	  var scope, options;
	  scope = ['https://www.googleapis.com/auth/devstorage.read_only', 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/drive.readonly'];
	  options = new gapi.auth2.SigninOptionsBuilder();
	  options.setPrompt('select_account');
	  options.setScope(scope.join(' '));
	  return gapi.auth2.getAuthInstance().signIn(options).then(function (user) {
	    var authResponse;
	    authResponse = user.getAuthResponse();
	    igv.setGoogleOauthToken(authResponse["access_token"]);
	    return authResponse["access_token"];
	  });
	}

	function getAccessToken() {
	  if (igv.oauth.google.access_token) {
	    return Promise.resolve(igv.oauth.google.access_token);
	  } else {
	    return signInHandler();
	  }
	}

	function updateSignInStatus(signInStatus) {// do nothing
	}

	var defineProperty$1 = Object.defineProperty;
	var cache = {};

	var thrower = function (it) {
	  throw it;
	};

	var arrayMethodUsesToLength = function (METHOD_NAME, options) {
	  if (has(cache, METHOD_NAME)) return cache[METHOD_NAME];
	  if (!options) options = {};
	  var method = [][METHOD_NAME];
	  var ACCESSORS = has(options, 'ACCESSORS') ? options.ACCESSORS : false;
	  var argument0 = has(options, 0) ? options[0] : thrower;
	  var argument1 = has(options, 1) ? options[1] : undefined;
	  return cache[METHOD_NAME] = !!method && !fails(function () {
	    if (ACCESSORS && !descriptors) return true;
	    var O = {
	      length: -1
	    };
	    if (ACCESSORS) defineProperty$1(O, 1, {
	      enumerable: true,
	      get: thrower
	    });else O[1] = 1;
	    method.call(O, argument0, argument1);
	  });
	};

	var $indexOf = arrayIncludes.indexOf;
	var nativeIndexOf = [].indexOf;
	var NEGATIVE_ZERO = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
	var STRICT_METHOD$1 = arrayMethodIsStrict('indexOf');
	var USES_TO_LENGTH = arrayMethodUsesToLength('indexOf', {
	  ACCESSORS: true,
	  1: 0
	}); // `Array.prototype.indexOf` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.indexof

	_export({
	  target: 'Array',
	  proto: true,
	  forced: NEGATIVE_ZERO || !STRICT_METHOD$1 || !USES_TO_LENGTH
	}, {
	  indexOf: function indexOf(searchElement
	  /* , fromIndex = 0 */
	  ) {
	    return NEGATIVE_ZERO // convert -0 to +0
	    ? nativeIndexOf.apply(this, arguments) || 0 : $indexOf(this, searchElement, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// https://tc39.github.io/ecma262/#sec-isarray

	var isArray = Array.isArray || function isArray(arg) {
	  return classofRaw(arg) == 'Array';
	};

	var createProperty = function (object, key, value) {
	  var propertyKey = toPrimitive(key);
	  if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));else object[propertyKey] = value;
	};

	var SPECIES$3 = wellKnownSymbol('species');

	var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
	  // We can't use this feature detection in V8 since it causes
	  // deoptimization and serious performance degradation
	  // https://github.com/zloirock/core-js/issues/677
	  return engineV8Version >= 51 || !fails(function () {
	    var array = [];
	    var constructor = array.constructor = {};

	    constructor[SPECIES$3] = function () {
	      return {
	        foo: 1
	      };
	    };

	    return array[METHOD_NAME](Boolean).foo !== 1;
	  });
	};

	var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('slice');
	var USES_TO_LENGTH$1 = arrayMethodUsesToLength('slice', {
	  ACCESSORS: true,
	  0: 0,
	  1: 2
	});
	var SPECIES$4 = wellKnownSymbol('species');
	var nativeSlice = [].slice;
	var max$1 = Math.max; // `Array.prototype.slice` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.slice
	// fallback for not array-like ES3 strings and DOM objects

	_export({
	  target: 'Array',
	  proto: true,
	  forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH$1
	}, {
	  slice: function slice(start, end) {
	    var O = toIndexedObject(this);
	    var length = toLength(O.length);
	    var k = toAbsoluteIndex(start, length);
	    var fin = toAbsoluteIndex(end === undefined ? length : end, length); // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible

	    var Constructor, result, n;

	    if (isArray(O)) {
	      Constructor = O.constructor; // cross-realm fallback

	      if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
	        Constructor = undefined;
	      } else if (isObject(Constructor)) {
	        Constructor = Constructor[SPECIES$4];
	        if (Constructor === null) Constructor = undefined;
	      }

	      if (Constructor === Array || Constructor === undefined) {
	        return nativeSlice.call(O, k, fin);
	      }
	    }

	    result = new (Constructor === undefined ? Array : Constructor)(max$1(fin - k, 0));

	    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);

	    result.length = n;
	    return result;
	  }
	});

	// https://tc39.github.io/ecma262/#sec-toobject

	var toObject = function (argument) {
	  return Object(requireObjectCoercible(argument));
	};

	var SPECIES$5 = wellKnownSymbol('species'); // `ArraySpeciesCreate` abstract operation
	// https://tc39.github.io/ecma262/#sec-arrayspeciescreate

	var arraySpeciesCreate = function (originalArray, length) {
	  var C;

	  if (isArray(originalArray)) {
	    C = originalArray.constructor; // cross-realm fallback

	    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;else if (isObject(C)) {
	      C = C[SPECIES$5];
	      if (C === null) C = undefined;
	    }
	  }

	  return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
	};

	var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
	var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
	var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded'; // We can't use this feature detection in V8 since it causes
	// deoptimization and serious performance degradation
	// https://github.com/zloirock/core-js/issues/679

	var IS_CONCAT_SPREADABLE_SUPPORT = engineV8Version >= 51 || !fails(function () {
	  var array = [];
	  array[IS_CONCAT_SPREADABLE] = false;
	  return array.concat()[0] !== array;
	});
	var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

	var isConcatSpreadable = function (O) {
	  if (!isObject(O)) return false;
	  var spreadable = O[IS_CONCAT_SPREADABLE];
	  return spreadable !== undefined ? !!spreadable : isArray(O);
	};

	var FORCED$1 = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT; // `Array.prototype.concat` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.concat
	// with adding support of @@isConcatSpreadable and @@species

	_export({
	  target: 'Array',
	  proto: true,
	  forced: FORCED$1
	}, {
	  concat: function concat(arg) {
	    // eslint-disable-line no-unused-vars
	    var O = toObject(this);
	    var A = arraySpeciesCreate(O, 0);
	    var n = 0;
	    var i, k, length, len, E;

	    for (i = -1, length = arguments.length; i < length; i++) {
	      E = i === -1 ? O : arguments[i];

	      if (isConcatSpreadable(E)) {
	        len = toLength(E.length);
	        if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);

	        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
	      } else {
	        if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
	        createProperty(A, n++, E);
	      }
	    }

	    A.length = n;
	    return A;
	  }
	});

	// https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags


	var regexpFlags = function () {
	  var that = anObject(this);
	  var result = '';
	  if (that.global) result += 'g';
	  if (that.ignoreCase) result += 'i';
	  if (that.multiline) result += 'm';
	  if (that.dotAll) result += 's';
	  if (that.unicode) result += 'u';
	  if (that.sticky) result += 'y';
	  return result;
	};

	// so we use an intermediate function.


	function RE(s, f) {
	  return RegExp(s, f);
	}

	var UNSUPPORTED_Y = fails(function () {
	  // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
	  var re = RE('a', 'y');
	  re.lastIndex = 2;
	  return re.exec('abcd') != null;
	});
	var BROKEN_CARET = fails(function () {
	  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
	  var re = RE('^r', 'gy');
	  re.lastIndex = 2;
	  return re.exec('str') != null;
	});
	var regexpStickyHelpers = {
	  UNSUPPORTED_Y: UNSUPPORTED_Y,
	  BROKEN_CARET: BROKEN_CARET
	};

	var nativeExec = RegExp.prototype.exec; // This always refers to the native implementation, because the
	// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
	// which loads this file before patching the method.

	var nativeReplace = String.prototype.replace;
	var patchedExec = nativeExec;

	var UPDATES_LAST_INDEX_WRONG = function () {
	  var re1 = /a/;
	  var re2 = /b*/g;
	  nativeExec.call(re1, 'a');
	  nativeExec.call(re2, 'a');
	  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
	}();

	var UNSUPPORTED_Y$1 = regexpStickyHelpers.UNSUPPORTED_Y || regexpStickyHelpers.BROKEN_CARET; // nonparticipating capturing group, copied from es5-shim's String#split patch.

	var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;
	var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$1;

	if (PATCH) {
	  patchedExec = function exec(str) {
	    var re = this;
	    var lastIndex, reCopy, match, i;
	    var sticky = UNSUPPORTED_Y$1 && re.sticky;
	    var flags = regexpFlags.call(re);
	    var source = re.source;
	    var charsAdded = 0;
	    var strCopy = str;

	    if (sticky) {
	      flags = flags.replace('y', '');

	      if (flags.indexOf('g') === -1) {
	        flags += 'g';
	      }

	      strCopy = String(str).slice(re.lastIndex); // Support anchored sticky behavior.

	      if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== '\n')) {
	        source = '(?: ' + source + ')';
	        strCopy = ' ' + strCopy;
	        charsAdded++;
	      } // ^(? + rx + ) is needed, in combination with some str slicing, to
	      // simulate the 'y' flag.


	      reCopy = new RegExp('^(?:' + source + ')', flags);
	    }

	    if (NPCG_INCLUDED) {
	      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
	    }

	    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;
	    match = nativeExec.call(sticky ? reCopy : re, strCopy);

	    if (sticky) {
	      if (match) {
	        match.input = match.input.slice(charsAdded);
	        match[0] = match[0].slice(charsAdded);
	        match.index = re.lastIndex;
	        re.lastIndex += match[0].length;
	      } else re.lastIndex = 0;
	    } else if (UPDATES_LAST_INDEX_WRONG && match) {
	      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
	    }

	    if (NPCG_INCLUDED && match && match.length > 1) {
	      // Fix browsers whose `exec` methods don't consistently return `undefined`
	      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
	      nativeReplace.call(match[0], reCopy, function () {
	        for (i = 1; i < arguments.length - 2; i++) {
	          if (arguments[i] === undefined) match[i] = undefined;
	        }
	      });
	    }

	    return match;
	  };
	}

	var regexpExec = patchedExec;

	_export({
	  target: 'RegExp',
	  proto: true,
	  forced: /./.exec !== regexpExec
	}, {
	  exec: regexpExec
	});

	var SPECIES$6 = wellKnownSymbol('species');
	var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
	  // #replace needs built-in support for named groups.
	  // #match works fine because it just return the exec results, even if it has
	  // a "grops" property.
	  var re = /./;

	  re.exec = function () {
	    var result = [];
	    result.groups = {
	      a: '7'
	    };
	    return result;
	  };

	  return ''.replace(re, '$<a>') !== '7';
	}); // IE <= 11 replaces $0 with the whole match, as if it was $&
	// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0

	var REPLACE_KEEPS_$0 = function () {
	  return 'a'.replace(/./, '$0') === '$0';
	}();

	var REPLACE = wellKnownSymbol('replace'); // Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string

	var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = function () {
	  if (/./[REPLACE]) {
	    return /./[REPLACE]('a', '$0') === '';
	  }

	  return false;
	}(); // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
	// Weex JS has frozen built-in prototypes, so use try / catch wrapper


	var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
	  var re = /(?:)/;
	  var originalExec = re.exec;

	  re.exec = function () {
	    return originalExec.apply(this, arguments);
	  };

	  var result = 'ab'.split(re);
	  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
	});

	var fixRegexpWellKnownSymbolLogic = function (KEY, length, exec, sham) {
	  var SYMBOL = wellKnownSymbol(KEY);
	  var DELEGATES_TO_SYMBOL = !fails(function () {
	    // String methods call symbol-named RegEp methods
	    var O = {};

	    O[SYMBOL] = function () {
	      return 7;
	    };

	    return ''[KEY](O) != 7;
	  });
	  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
	    // Symbol-named RegExp methods call .exec
	    var execCalled = false;
	    var re = /a/;

	    if (KEY === 'split') {
	      // We can't use real regex here since it causes deoptimization
	      // and serious performance degradation in V8
	      // https://github.com/zloirock/core-js/issues/306
	      re = {}; // RegExp[@@split] doesn't call the regex's exec method, but first creates
	      // a new one. We need to return the patched regex when creating the new one.

	      re.constructor = {};

	      re.constructor[SPECIES$6] = function () {
	        return re;
	      };

	      re.flags = '';
	      re[SYMBOL] = /./[SYMBOL];
	    }

	    re.exec = function () {
	      execCalled = true;
	      return null;
	    };

	    re[SYMBOL]('');
	    return !execCalled;
	  });

	  if (!DELEGATES_TO_SYMBOL || !DELEGATES_TO_EXEC || KEY === 'replace' && !(REPLACE_SUPPORTS_NAMED_GROUPS && REPLACE_KEEPS_$0 && !REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE) || KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC) {
	    var nativeRegExpMethod = /./[SYMBOL];
	    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
	      if (regexp.exec === regexpExec) {
	        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
	          // The native String method already delegates to @@method (this
	          // polyfilled function), leasing to infinite recursion.
	          // We avoid it by directly calling the native @@method method.
	          return {
	            done: true,
	            value: nativeRegExpMethod.call(regexp, str, arg2)
	          };
	        }

	        return {
	          done: true,
	          value: nativeMethod.call(str, regexp, arg2)
	        };
	      }

	      return {
	        done: false
	      };
	    }, {
	      REPLACE_KEEPS_$0: REPLACE_KEEPS_$0,
	      REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE: REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
	    });
	    var stringMethod = methods[0];
	    var regexMethod = methods[1];
	    redefine(String.prototype, KEY, stringMethod);
	    redefine(RegExp.prototype, SYMBOL, length == 2 // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
	    // 21.2.5.11 RegExp.prototype[@@split](string, limit)
	    ? function (string, arg) {
	      return regexMethod.call(string, this, arg);
	    } // 21.2.5.6 RegExp.prototype[@@match](string)
	    // 21.2.5.9 RegExp.prototype[@@search](string)
	    : function (string) {
	      return regexMethod.call(string, this);
	    });
	  }

	  if (sham) createNonEnumerableProperty(RegExp.prototype[SYMBOL], 'sham', true);
	};

	var createMethod$1 = function (CONVERT_TO_STRING) {
	  return function ($this, pos) {
	    var S = String(requireObjectCoercible($this));
	    var position = toInteger(pos);
	    var size = S.length;
	    var first, second;
	    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
	    first = S.charCodeAt(position);
	    return first < 0xD800 || first > 0xDBFF || position + 1 === size || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF ? CONVERT_TO_STRING ? S.charAt(position) : first : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
	  };
	};

	var stringMultibyte = {
	  // `String.prototype.codePointAt` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
	  codeAt: createMethod$1(false),
	  // `String.prototype.at` method
	  // https://github.com/mathiasbynens/String.prototype.at
	  charAt: createMethod$1(true)
	};

	var charAt = stringMultibyte.charAt; // `AdvanceStringIndex` abstract operation
	// https://tc39.github.io/ecma262/#sec-advancestringindex

	var advanceStringIndex = function (S, index, unicode) {
	  return index + (unicode ? charAt(S, index).length : 1);
	};

	// https://tc39.github.io/ecma262/#sec-regexpexec

	var regexpExecAbstract = function (R, S) {
	  var exec = R.exec;

	  if (typeof exec === 'function') {
	    var result = exec.call(R, S);

	    if (typeof result !== 'object') {
	      throw TypeError('RegExp exec method returned something other than an Object or null');
	    }

	    return result;
	  }

	  if (classofRaw(R) !== 'RegExp') {
	    throw TypeError('RegExp#exec called on incompatible receiver');
	  }

	  return regexpExec.call(R, S);
	};

	var max$2 = Math.max;
	var min$2 = Math.min;
	var floor$1 = Math.floor;
	var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
	var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;

	var maybeToString = function (it) {
	  return it === undefined ? it : String(it);
	}; // @@replace logic


	fixRegexpWellKnownSymbolLogic('replace', 2, function (REPLACE, nativeReplace, maybeCallNative, reason) {
	  var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = reason.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE;
	  var REPLACE_KEEPS_$0 = reason.REPLACE_KEEPS_$0;
	  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';
	  return [// `String.prototype.replace` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.replace
	  function replace(searchValue, replaceValue) {
	    var O = requireObjectCoercible(this);
	    var replacer = searchValue == undefined ? undefined : searchValue[REPLACE];
	    return replacer !== undefined ? replacer.call(searchValue, O, replaceValue) : nativeReplace.call(String(O), searchValue, replaceValue);
	  }, // `RegExp.prototype[@@replace]` method
	  // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
	  function (regexp, replaceValue) {
	    if (!REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE && REPLACE_KEEPS_$0 || typeof replaceValue === 'string' && replaceValue.indexOf(UNSAFE_SUBSTITUTE) === -1) {
	      var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
	      if (res.done) return res.value;
	    }

	    var rx = anObject(regexp);
	    var S = String(this);
	    var functionalReplace = typeof replaceValue === 'function';
	    if (!functionalReplace) replaceValue = String(replaceValue);
	    var global = rx.global;

	    if (global) {
	      var fullUnicode = rx.unicode;
	      rx.lastIndex = 0;
	    }

	    var results = [];

	    while (true) {
	      var result = regexpExecAbstract(rx, S);
	      if (result === null) break;
	      results.push(result);
	      if (!global) break;
	      var matchStr = String(result[0]);
	      if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
	    }

	    var accumulatedResult = '';
	    var nextSourcePosition = 0;

	    for (var i = 0; i < results.length; i++) {
	      result = results[i];
	      var matched = String(result[0]);
	      var position = max$2(min$2(toInteger(result.index), S.length), 0);
	      var captures = []; // NOTE: This is equivalent to
	      //   captures = result.slice(1).map(maybeToString)
	      // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
	      // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
	      // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.

	      for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));

	      var namedCaptures = result.groups;

	      if (functionalReplace) {
	        var replacerArgs = [matched].concat(captures, position, S);
	        if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
	        var replacement = String(replaceValue.apply(undefined, replacerArgs));
	      } else {
	        replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
	      }

	      if (position >= nextSourcePosition) {
	        accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
	        nextSourcePosition = position + matched.length;
	      }
	    }

	    return accumulatedResult + S.slice(nextSourcePosition);
	  }]; // https://tc39.github.io/ecma262/#sec-getsubstitution

	  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
	    var tailPos = position + matched.length;
	    var m = captures.length;
	    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;

	    if (namedCaptures !== undefined) {
	      namedCaptures = toObject(namedCaptures);
	      symbols = SUBSTITUTION_SYMBOLS;
	    }

	    return nativeReplace.call(replacement, symbols, function (match, ch) {
	      var capture;

	      switch (ch.charAt(0)) {
	        case '$':
	          return '$';

	        case '&':
	          return matched;

	        case '`':
	          return str.slice(0, position);

	        case "'":
	          return str.slice(tailPos);

	        case '<':
	          capture = namedCaptures[ch.slice(1, -1)];
	          break;

	        default:
	          // \d\d?
	          var n = +ch;
	          if (n === 0) return match;

	          if (n > m) {
	            var f = floor$1(n / 10);
	            if (f === 0) return match;
	            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
	            return match;
	          }

	          capture = captures[n - 1];
	      }

	      return capture === undefined ? '' : capture;
	    });
	  }
	});

	var MATCH = wellKnownSymbol('match'); // `IsRegExp` abstract operation
	// https://tc39.github.io/ecma262/#sec-isregexp

	var isRegexp = function (it) {
	  var isRegExp;
	  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classofRaw(it) == 'RegExp');
	};

	var notARegexp = function (it) {
	  if (isRegexp(it)) {
	    throw TypeError("The method doesn't accept regular expressions");
	  }

	  return it;
	};

	var MATCH$1 = wellKnownSymbol('match');

	var correctIsRegexpLogic = function (METHOD_NAME) {
	  var regexp = /./;

	  try {
	    '/./'[METHOD_NAME](regexp);
	  } catch (e) {
	    try {
	      regexp[MATCH$1] = false;
	      return '/./'[METHOD_NAME](regexp);
	    } catch (f) {
	      /* empty */
	    }
	  }

	  return false;
	};

	var getOwnPropertyDescriptor$3 = objectGetOwnPropertyDescriptor.f;
	var nativeStartsWith = ''.startsWith;
	var min$3 = Math.min;
	var CORRECT_IS_REGEXP_LOGIC = correctIsRegexpLogic('startsWith'); // https://github.com/zloirock/core-js/pull/702

	var MDN_POLYFILL_BUG =  !CORRECT_IS_REGEXP_LOGIC && !!function () {
	  var descriptor = getOwnPropertyDescriptor$3(String.prototype, 'startsWith');
	  return descriptor && !descriptor.writable;
	}(); // `String.prototype.startsWith` method
	// https://tc39.github.io/ecma262/#sec-string.prototype.startswith

	_export({
	  target: 'String',
	  proto: true,
	  forced: !MDN_POLYFILL_BUG && !CORRECT_IS_REGEXP_LOGIC
	}, {
	  startsWith: function startsWith(searchString
	  /* , position = 0 */
	  ) {
	    var that = String(requireObjectCoercible(this));
	    notARegexp(searchString);
	    var index = toLength(min$3(arguments.length > 1 ? arguments[1] : undefined, that.length));
	    var search = String(searchString);
	    return nativeStartsWith ? nativeStartsWith.call(that, search, index) : that.slice(index, index + search.length) === search;
	  }
	});

	/*
	 *  The MIT License (MIT)
	 *
	 * Copyright (c) 2016-2017 The Regents of the University of California
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
	 * associated documentation files (the "Software"), to deal in the Software without restriction, including
	 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
	 * following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in all copies or substantial
	 * portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
	 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND
	 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
	 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 *
	 */
	//import igv from '../node_modules/igv/dist/igv.esm.min.js';
	function bitlyShortener(accessToken) {
	  if (!accessToken || accessToken === "BITLY_TOKEN") {
	    return undefined;
	  } else {
	    return /*#__PURE__*/function () {
	      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url) {
	        var api, devIP, endpoint;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                api = "https://api-ssl.bitly.com/v3/shorten";
	                devIP = "192.168.1.11";

	                if (url.startsWith("http://localhost")) {
	                  url = url.replace("localhost", devIP);
	                } // Dev hack


	                endpoint = api + "?access_token=" + accessToken + "&longUrl=" + encodeURIComponent(url);
	                return _context.abrupt("return", igv.xhr.loadJson(endpoint, {}).then(function (json) {
	                  return json.data.url;
	                }));

	              case 5:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee);
	      }));

	      return function (_x) {
	        return _ref.apply(this, arguments);
	      };
	    }();
	  }
	}

	function googleShortener(apiKey) {
	  if (!apiKey || apiKey === "API_KEY") {
	    return undefined;
	  } else {
	    return /*#__PURE__*/function () {
	      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(url) {
	        var api, endpoint;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                api = "https://www.googleapis.com/urlshortener/v1/url";
	                endpoint = api + "?key=" + apiKey;
	                return _context2.abrupt("return", igv.xhr.loadJson(endpoint, {
	                  sendData: JSON.stringify({
	                    "longUrl": url
	                  }),
	                  contentType: "application/json"
	                }).then(function (json) {
	                  return json.id;
	                }));

	              case 3:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2);
	      }));

	      return function (_x2) {
	        return _ref2.apply(this, arguments);
	      };
	    }();
	  }
	}

	function tinyURLShortener(_ref3) {
	  var endpoint = _ref3.endpoint;
	  endpoint = endpoint || "https://2et6uxfezb.execute-api.us-east-1.amazonaws.com/dev/tinyurl/";
	  return /*#__PURE__*/function () {
	    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(url) {
	      var enc, response;
	      return regeneratorRuntime.wrap(function _callee3$(_context3) {
	        while (1) {
	          switch (_context3.prev = _context3.next) {
	            case 0:
	              enc = encodeURIComponent(url);
	              _context3.next = 3;
	              return fetch("".concat(endpoint).concat(enc));

	            case 3:
	              response = _context3.sent;

	              if (!response.ok) {
	                _context3.next = 8;
	                break;
	              }

	              return _context3.abrupt("return", response.text());

	            case 8:
	              throw new Error(response.statusText);

	            case 9:
	            case "end":
	              return _context3.stop();
	          }
	        }
	      }, _callee3);
	    }));

	    return function (_x3) {
	      return _ref4.apply(this, arguments);
	    };
	  }();
	}

	var urlShortener;
	function setURLShortener(obj) {
	  var fn;

	  if (typeof obj === "function") {
	    fn = obj;
	  } else if (obj.provider) {
	    if ("tinyURL" === obj.provider) {
	      fn = tinyURLShortener(obj);
	    } else if ("bitly" === obj.provider && obj.apiKey) {
	      fn = bitlyShortener(obj.apiKey);
	    } else if ("google" === obj.provider && obj.apiKey) {
	      fn = googleShortener(obj.apiKey);
	    } else {
	      alertPanel.presentAlert("Unknown URL shortener provider: ".concat(obj.provider));
	    }
	  } else {
	    alertPanel.presentAlert("URL shortener object must either be an object specifying a provider and apiKey, or a function");
	  }

	  if (fn) {
	    urlShortener = {
	      shortenURL: fn
	    };
	  }

	  return fn;
	}
	function sessionURL() {
	  var surl, path, idx;
	  path = window.location.href.slice();
	  idx = path.indexOf("?");
	  surl = (idx > 0 ? path.substring(0, idx) : path) + "?sessionURL=blob:" + igv.getBrowser().compressedSession();
	  return surl;
	}
	function shortSessionURL(base, session) {
	  var url = base + "?sessionURL=blob:" + session;
	  return shortenURL(url);
	}

	function shortenURL(url) {
	  if (urlShortener) {
	    return urlShortener.shortenURL(url);
	  } else {
	    return Promise.resolve(url);
	  }
	}

	var push = [].push; // `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation

	var createMethod$2 = function (TYPE) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  return function ($this, callbackfn, that, specificCreate) {
	    var O = toObject($this);
	    var self = indexedObject(O);
	    var boundFunction = functionBindContext(callbackfn, that, 3);
	    var length = toLength(self.length);
	    var index = 0;
	    var create = specificCreate || arraySpeciesCreate;
	    var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
	    var value, result;

	    for (; length > index; index++) if (NO_HOLES || index in self) {
	      value = self[index];
	      result = boundFunction(value, index, O);

	      if (TYPE) {
	        if (IS_MAP) target[index] = result; // map
	        else if (result) switch (TYPE) {
	            case 3:
	              return true;
	            // some

	            case 5:
	              return value;
	            // find

	            case 6:
	              return index;
	            // findIndex

	            case 2:
	              push.call(target, value);
	            // filter
	          } else if (IS_EVERY) return false; // every
	      }
	    }

	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
	  };
	};

	var arrayIteration = {
	  // `Array.prototype.forEach` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	  forEach: createMethod$2(0),
	  // `Array.prototype.map` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.map
	  map: createMethod$2(1),
	  // `Array.prototype.filter` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.filter
	  filter: createMethod$2(2),
	  // `Array.prototype.some` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.some
	  some: createMethod$2(3),
	  // `Array.prototype.every` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.every
	  every: createMethod$2(4),
	  // `Array.prototype.find` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.find
	  find: createMethod$2(5),
	  // `Array.prototype.findIndex` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
	  findIndex: createMethod$2(6)
	};

	// https://tc39.github.io/ecma262/#sec-object.keys

	var objectKeys = Object.keys || function keys(O) {
	  return objectKeysInternal(O, enumBugKeys);
	};

	// https://tc39.github.io/ecma262/#sec-object.defineproperties

	var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject(O);
	  var keys = objectKeys(Properties);
	  var length = keys.length;
	  var index = 0;
	  var key;

	  while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);

	  return O;
	};

	var GT = '>';
	var LT = '<';
	var PROTOTYPE = 'prototype';
	var SCRIPT = 'script';
	var IE_PROTO = sharedKey('IE_PROTO');

	var EmptyConstructor = function () {
	  /* empty */
	};

	var scriptTag = function (content) {
	  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
	}; // Create object with fake `null` prototype: use ActiveX Object with cleared prototype


	var NullProtoObjectViaActiveX = function (activeXDocument) {
	  activeXDocument.write(scriptTag(''));
	  activeXDocument.close();
	  var temp = activeXDocument.parentWindow.Object;
	  activeXDocument = null; // avoid memory leak

	  return temp;
	}; // Create object with fake `null` prototype: use iframe Object with cleared prototype


	var NullProtoObjectViaIFrame = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = documentCreateElement('iframe');
	  var JS = 'java' + SCRIPT + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html.appendChild(iframe); // https://github.com/zloirock/core-js/issues/475

	  iframe.src = String(JS);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(scriptTag('document.F=Object'));
	  iframeDocument.close();
	  return iframeDocument.F;
	}; // Check for document.domain and active x support
	// No need to use active x approach when document.domain is not set
	// see https://github.com/es-shims/es5-shim/issues/150
	// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
	// avoid IE GC bug


	var activeXDocument;

	var NullProtoObject = function () {
	  try {
	    /* global ActiveXObject */
	    activeXDocument = document.domain && new ActiveXObject('htmlfile');
	  } catch (error) {
	    /* ignore */
	  }

	  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
	  var length = enumBugKeys.length;

	  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];

	  return NullProtoObject();
	};

	hiddenKeys[IE_PROTO] = true; // `Object.create` method
	// https://tc39.github.io/ecma262/#sec-object.create

	var objectCreate = Object.create || function create(O, Properties) {
	  var result;

	  if (O !== null) {
	    EmptyConstructor[PROTOTYPE] = anObject(O);
	    result = new EmptyConstructor();
	    EmptyConstructor[PROTOTYPE] = null; // add "__proto__" for Object.getPrototypeOf polyfill

	    result[IE_PROTO] = O;
	  } else result = NullProtoObject();

	  return Properties === undefined ? result : objectDefineProperties(result, Properties);
	};

	var UNSCOPABLES = wellKnownSymbol('unscopables');
	var ArrayPrototype$1 = Array.prototype; // Array.prototype[@@unscopables]
	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

	if (ArrayPrototype$1[UNSCOPABLES] == undefined) {
	  objectDefineProperty.f(ArrayPrototype$1, UNSCOPABLES, {
	    configurable: true,
	    value: objectCreate(null)
	  });
	} // add a key to Array.prototype[@@unscopables]


	var addToUnscopables = function (key) {
	  ArrayPrototype$1[UNSCOPABLES][key] = true;
	};

	var $find = arrayIteration.find;
	var FIND = 'find';
	var SKIPS_HOLES = true;
	var USES_TO_LENGTH$2 = arrayMethodUsesToLength(FIND); // Shouldn't skip holes

	if (FIND in []) Array(1)[FIND](function () {
	  SKIPS_HOLES = false;
	}); // `Array.prototype.find` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.find

	_export({
	  target: 'Array',
	  proto: true,
	  forced: SKIPS_HOLES || !USES_TO_LENGTH$2
	}, {
	  find: function find(callbackfn
	  /* , that = undefined */
	  ) {
	    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	}); // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

	addToUnscopables(FIND);

	var correctPrototypeGetter = !fails(function () {
	  function F() {
	    /* empty */
	  }

	  F.prototype.constructor = null;
	  return Object.getPrototypeOf(new F()) !== F.prototype;
	});

	var IE_PROTO$1 = sharedKey('IE_PROTO');
	var ObjectPrototype = Object.prototype; // `Object.getPrototypeOf` method
	// https://tc39.github.io/ecma262/#sec-object.getprototypeof

	var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
	  O = toObject(O);
	  if (has(O, IE_PROTO$1)) return O[IE_PROTO$1];

	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  }

	  return O instanceof Object ? ObjectPrototype : null;
	};

	var ITERATOR$3 = wellKnownSymbol('iterator');
	var BUGGY_SAFARI_ITERATORS = false;

	var returnThis = function () {
	  return this;
	}; // `%IteratorPrototype%` object
	// https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object


	var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

	if ([].keys) {
	  arrayIterator = [].keys(); // Safari 8 has buggy iterators w/o `next`

	  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;else {
	    PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
	    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
	  }
	}

	if (IteratorPrototype == undefined) IteratorPrototype = {}; // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()

	if ( !has(IteratorPrototype, ITERATOR$3)) {
	  createNonEnumerableProperty(IteratorPrototype, ITERATOR$3, returnThis);
	}

	var iteratorsCore = {
	  IteratorPrototype: IteratorPrototype,
	  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
	};

	var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;

	var returnThis$1 = function () {
	  return this;
	};

	var createIteratorConstructor = function (IteratorConstructor, NAME, next) {
	  var TO_STRING_TAG = NAME + ' Iterator';
	  IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, {
	    next: createPropertyDescriptor(1, next)
	  });
	  setToStringTag(IteratorConstructor, TO_STRING_TAG, false);
	  iterators[TO_STRING_TAG] = returnThis$1;
	  return IteratorConstructor;
	};

	var aPossiblePrototype = function (it) {
	  if (!isObject(it) && it !== null) {
	    throw TypeError("Can't set " + String(it) + ' as a prototype');
	  }

	  return it;
	};

	// https://tc39.github.io/ecma262/#sec-object.setprototypeof
	// Works with __proto__ only. Old v8 can't work with null proto objects.

	/* eslint-disable no-proto */

	var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
	  var CORRECT_SETTER = false;
	  var test = {};
	  var setter;

	  try {
	    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
	    setter.call(test, []);
	    CORRECT_SETTER = test instanceof Array;
	  } catch (error) {
	    /* empty */
	  }

	  return function setPrototypeOf(O, proto) {
	    anObject(O);
	    aPossiblePrototype(proto);
	    if (CORRECT_SETTER) setter.call(O, proto);else O.__proto__ = proto;
	    return O;
	  };
	}() : undefined);

	var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
	var BUGGY_SAFARI_ITERATORS$1 = iteratorsCore.BUGGY_SAFARI_ITERATORS;
	var ITERATOR$4 = wellKnownSymbol('iterator');
	var KEYS = 'keys';
	var VALUES = 'values';
	var ENTRIES = 'entries';

	var returnThis$2 = function () {
	  return this;
	};

	var defineIterator = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
	  createIteratorConstructor(IteratorConstructor, NAME, next);

	  var getIterationMethod = function (KIND) {
	    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
	    if (!BUGGY_SAFARI_ITERATORS$1 && KIND in IterablePrototype) return IterablePrototype[KIND];

	    switch (KIND) {
	      case KEYS:
	        return function keys() {
	          return new IteratorConstructor(this, KIND);
	        };

	      case VALUES:
	        return function values() {
	          return new IteratorConstructor(this, KIND);
	        };

	      case ENTRIES:
	        return function entries() {
	          return new IteratorConstructor(this, KIND);
	        };
	    }

	    return function () {
	      return new IteratorConstructor(this);
	    };
	  };

	  var TO_STRING_TAG = NAME + ' Iterator';
	  var INCORRECT_VALUES_NAME = false;
	  var IterablePrototype = Iterable.prototype;
	  var nativeIterator = IterablePrototype[ITERATOR$4] || IterablePrototype['@@iterator'] || DEFAULT && IterablePrototype[DEFAULT];
	  var defaultIterator = !BUGGY_SAFARI_ITERATORS$1 && nativeIterator || getIterationMethod(DEFAULT);
	  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
	  var CurrentIteratorPrototype, methods, KEY; // fix native

	  if (anyNativeIterator) {
	    CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));

	    if (IteratorPrototype$2 !== Object.prototype && CurrentIteratorPrototype.next) {
	      if ( objectGetPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype$2) {
	        if (objectSetPrototypeOf) {
	          objectSetPrototypeOf(CurrentIteratorPrototype, IteratorPrototype$2);
	        } else if (typeof CurrentIteratorPrototype[ITERATOR$4] != 'function') {
	          createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR$4, returnThis$2);
	        }
	      } // Set @@toStringTag to native iterators


	      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true);
	    }
	  } // fix Array#{values, @@iterator}.name in V8 / FF


	  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
	    INCORRECT_VALUES_NAME = true;

	    defaultIterator = function values() {
	      return nativeIterator.call(this);
	    };
	  } // define iterator


	  if ( IterablePrototype[ITERATOR$4] !== defaultIterator) {
	    createNonEnumerableProperty(IterablePrototype, ITERATOR$4, defaultIterator);
	  }

	  iterators[NAME] = defaultIterator; // export additional methods

	  if (DEFAULT) {
	    methods = {
	      values: getIterationMethod(VALUES),
	      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
	      entries: getIterationMethod(ENTRIES)
	    };
	    if (FORCED) for (KEY in methods) {
	      if (BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
	        redefine(IterablePrototype, KEY, methods[KEY]);
	      }
	    } else _export({
	      target: NAME,
	      proto: true,
	      forced: BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME
	    }, methods);
	  }

	  return methods;
	};

	var ARRAY_ITERATOR = 'Array Iterator';
	var setInternalState$1 = internalState.set;
	var getInternalState$1 = internalState.getterFor(ARRAY_ITERATOR); // `Array.prototype.entries` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.entries
	// `Array.prototype.keys` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.keys
	// `Array.prototype.values` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.values
	// `Array.prototype[@@iterator]` method
	// https://tc39.github.io/ecma262/#sec-array.prototype-@@iterator
	// `CreateArrayIterator` internal method
	// https://tc39.github.io/ecma262/#sec-createarrayiterator

	var es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
	  setInternalState$1(this, {
	    type: ARRAY_ITERATOR,
	    target: toIndexedObject(iterated),
	    // target
	    index: 0,
	    // next index
	    kind: kind // kind

	  }); // `%ArrayIteratorPrototype%.next` method
	  // https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
	}, function () {
	  var state = getInternalState$1(this);
	  var target = state.target;
	  var kind = state.kind;
	  var index = state.index++;

	  if (!target || index >= target.length) {
	    state.target = undefined;
	    return {
	      value: undefined,
	      done: true
	    };
	  }

	  if (kind == 'keys') return {
	    value: index,
	    done: false
	  };
	  if (kind == 'values') return {
	    value: target[index],
	    done: false
	  };
	  return {
	    value: [index, target[index]],
	    done: false
	  };
	}, 'values'); // argumentsList[@@iterator] is %ArrayProto_values%
	// https://tc39.github.io/ecma262/#sec-createunmappedargumentsobject
	// https://tc39.github.io/ecma262/#sec-createmappedargumentsobject

	iterators.Arguments = iterators.Array; // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

	var defineProperty$2 = objectDefineProperty.f;
	var FunctionPrototype = Function.prototype;
	var FunctionPrototypeToString = FunctionPrototype.toString;
	var nameRE = /^\s*function ([^ (]*)/;
	var NAME = 'name'; // Function instances `.name` property
	// https://tc39.github.io/ecma262/#sec-function-instances-name

	if (descriptors && !(NAME in FunctionPrototype)) {
	  defineProperty$2(FunctionPrototype, NAME, {
	    configurable: true,
	    get: function () {
	      try {
	        return FunctionPrototypeToString.call(this).match(nameRE)[1];
	      } catch (error) {
	        return '';
	      }
	    }
	  });
	}

	var freezing = !fails(function () {
	  return Object.isExtensible(Object.preventExtensions({}));
	});

	var internalMetadata = createCommonjsModule(function (module) {
	  var defineProperty = objectDefineProperty.f;
	  var METADATA = uid('meta');
	  var id = 0;

	  var isExtensible = Object.isExtensible || function () {
	    return true;
	  };

	  var setMetadata = function (it) {
	    defineProperty(it, METADATA, {
	      value: {
	        objectID: 'O' + ++id,
	        // object ID
	        weakData: {} // weak collections IDs

	      }
	    });
	  };

	  var fastKey = function (it, create) {
	    // return a primitive with prefix
	    if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;

	    if (!has(it, METADATA)) {
	      // can't set metadata to uncaught frozen object
	      if (!isExtensible(it)) return 'F'; // not necessary to add metadata

	      if (!create) return 'E'; // add missing metadata

	      setMetadata(it); // return object ID
	    }

	    return it[METADATA].objectID;
	  };

	  var getWeakData = function (it, create) {
	    if (!has(it, METADATA)) {
	      // can't set metadata to uncaught frozen object
	      if (!isExtensible(it)) return true; // not necessary to add metadata

	      if (!create) return false; // add missing metadata

	      setMetadata(it); // return the store of weak collections IDs
	    }

	    return it[METADATA].weakData;
	  }; // add metadata on freeze-family methods calling


	  var onFreeze = function (it) {
	    if (freezing && meta.REQUIRED && isExtensible(it) && !has(it, METADATA)) setMetadata(it);
	    return it;
	  };

	  var meta = module.exports = {
	    REQUIRED: false,
	    fastKey: fastKey,
	    getWeakData: getWeakData,
	    onFreeze: onFreeze
	  };
	  hiddenKeys[METADATA] = true;
	});
	var internalMetadata_1 = internalMetadata.REQUIRED;
	var internalMetadata_2 = internalMetadata.fastKey;
	var internalMetadata_3 = internalMetadata.getWeakData;
	var internalMetadata_4 = internalMetadata.onFreeze;

	var inheritIfRequired = function ($this, dummy, Wrapper) {
	  var NewTarget, NewTargetPrototype;
	  if ( // it can work only with native `setPrototypeOf`
	  objectSetPrototypeOf && // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
	  typeof (NewTarget = dummy.constructor) == 'function' && NewTarget !== Wrapper && isObject(NewTargetPrototype = NewTarget.prototype) && NewTargetPrototype !== Wrapper.prototype) objectSetPrototypeOf($this, NewTargetPrototype);
	  return $this;
	};

	var collection = function (CONSTRUCTOR_NAME, wrapper, common) {
	  var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
	  var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
	  var ADDER = IS_MAP ? 'set' : 'add';
	  var NativeConstructor = global_1[CONSTRUCTOR_NAME];
	  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
	  var Constructor = NativeConstructor;
	  var exported = {};

	  var fixMethod = function (KEY) {
	    var nativeMethod = NativePrototype[KEY];
	    redefine(NativePrototype, KEY, KEY == 'add' ? function add(value) {
	      nativeMethod.call(this, value === 0 ? 0 : value);
	      return this;
	    } : KEY == 'delete' ? function (key) {
	      return IS_WEAK && !isObject(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
	    } : KEY == 'get' ? function get(key) {
	      return IS_WEAK && !isObject(key) ? undefined : nativeMethod.call(this, key === 0 ? 0 : key);
	    } : KEY == 'has' ? function has(key) {
	      return IS_WEAK && !isObject(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
	    } : function set(key, value) {
	      nativeMethod.call(this, key === 0 ? 0 : key, value);
	      return this;
	    });
	  }; // eslint-disable-next-line max-len


	  if (isForced_1(CONSTRUCTOR_NAME, typeof NativeConstructor != 'function' || !(IS_WEAK || NativePrototype.forEach && !fails(function () {
	    new NativeConstructor().entries().next();
	  })))) {
	    // create collection constructor
	    Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
	    internalMetadata.REQUIRED = true;
	  } else if (isForced_1(CONSTRUCTOR_NAME, true)) {
	    var instance = new Constructor(); // early implementations not supports chaining

	    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance; // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false

	    var THROWS_ON_PRIMITIVES = fails(function () {
	      instance.has(1);
	    }); // most early implementations doesn't supports iterables, most modern - not close it correctly
	    // eslint-disable-next-line no-new

	    var ACCEPT_ITERABLES = checkCorrectnessOfIteration(function (iterable) {
	      new NativeConstructor(iterable);
	    }); // for early implementations -0 and +0 not the same

	    var BUGGY_ZERO = !IS_WEAK && fails(function () {
	      // V8 ~ Chromium 42- fails only with 5+ elements
	      var $instance = new NativeConstructor();
	      var index = 5;

	      while (index--) $instance[ADDER](index, index);

	      return !$instance.has(-0);
	    });

	    if (!ACCEPT_ITERABLES) {
	      Constructor = wrapper(function (dummy, iterable) {
	        anInstance(dummy, Constructor, CONSTRUCTOR_NAME);
	        var that = inheritIfRequired(new NativeConstructor(), dummy, Constructor);
	        if (iterable != undefined) iterate_1(iterable, that[ADDER], that, IS_MAP);
	        return that;
	      });
	      Constructor.prototype = NativePrototype;
	      NativePrototype.constructor = Constructor;
	    }

	    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
	      fixMethod('delete');
	      fixMethod('has');
	      IS_MAP && fixMethod('get');
	    }

	    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER); // weak collections should not contains .clear method

	    if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
	  }

	  exported[CONSTRUCTOR_NAME] = Constructor;
	  _export({
	    global: true,
	    forced: Constructor != NativeConstructor
	  }, exported);
	  setToStringTag(Constructor, CONSTRUCTOR_NAME);
	  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);
	  return Constructor;
	};

	var defineProperty$3 = objectDefineProperty.f;
	var fastKey = internalMetadata.fastKey;
	var setInternalState$2 = internalState.set;
	var internalStateGetterFor = internalState.getterFor;
	var collectionStrong = {
	  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
	    var C = wrapper(function (that, iterable) {
	      anInstance(that, C, CONSTRUCTOR_NAME);
	      setInternalState$2(that, {
	        type: CONSTRUCTOR_NAME,
	        index: objectCreate(null),
	        first: undefined,
	        last: undefined,
	        size: 0
	      });
	      if (!descriptors) that.size = 0;
	      if (iterable != undefined) iterate_1(iterable, that[ADDER], that, IS_MAP);
	    });
	    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

	    var define = function (that, key, value) {
	      var state = getInternalState(that);
	      var entry = getEntry(that, key);
	      var previous, index; // change existing entry

	      if (entry) {
	        entry.value = value; // create new entry
	      } else {
	        state.last = entry = {
	          index: index = fastKey(key, true),
	          key: key,
	          value: value,
	          previous: previous = state.last,
	          next: undefined,
	          removed: false
	        };
	        if (!state.first) state.first = entry;
	        if (previous) previous.next = entry;
	        if (descriptors) state.size++;else that.size++; // add to index

	        if (index !== 'F') state.index[index] = entry;
	      }

	      return that;
	    };

	    var getEntry = function (that, key) {
	      var state = getInternalState(that); // fast case

	      var index = fastKey(key);
	      var entry;
	      if (index !== 'F') return state.index[index]; // frozen object case

	      for (entry = state.first; entry; entry = entry.next) {
	        if (entry.key == key) return entry;
	      }
	    };

	    redefineAll(C.prototype, {
	      // 23.1.3.1 Map.prototype.clear()
	      // 23.2.3.2 Set.prototype.clear()
	      clear: function clear() {
	        var that = this;
	        var state = getInternalState(that);
	        var data = state.index;
	        var entry = state.first;

	        while (entry) {
	          entry.removed = true;
	          if (entry.previous) entry.previous = entry.previous.next = undefined;
	          delete data[entry.index];
	          entry = entry.next;
	        }

	        state.first = state.last = undefined;
	        if (descriptors) state.size = 0;else that.size = 0;
	      },
	      // 23.1.3.3 Map.prototype.delete(key)
	      // 23.2.3.4 Set.prototype.delete(value)
	      'delete': function (key) {
	        var that = this;
	        var state = getInternalState(that);
	        var entry = getEntry(that, key);

	        if (entry) {
	          var next = entry.next;
	          var prev = entry.previous;
	          delete state.index[entry.index];
	          entry.removed = true;
	          if (prev) prev.next = next;
	          if (next) next.previous = prev;
	          if (state.first == entry) state.first = next;
	          if (state.last == entry) state.last = prev;
	          if (descriptors) state.size--;else that.size--;
	        }

	        return !!entry;
	      },
	      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
	      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
	      forEach: function forEach(callbackfn
	      /* , that = undefined */
	      ) {
	        var state = getInternalState(this);
	        var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
	        var entry;

	        while (entry = entry ? entry.next : state.first) {
	          boundFunction(entry.value, entry.key, this); // revert to the last existing entry

	          while (entry && entry.removed) entry = entry.previous;
	        }
	      },
	      // 23.1.3.7 Map.prototype.has(key)
	      // 23.2.3.7 Set.prototype.has(value)
	      has: function has(key) {
	        return !!getEntry(this, key);
	      }
	    });
	    redefineAll(C.prototype, IS_MAP ? {
	      // 23.1.3.6 Map.prototype.get(key)
	      get: function get(key) {
	        var entry = getEntry(this, key);
	        return entry && entry.value;
	      },
	      // 23.1.3.9 Map.prototype.set(key, value)
	      set: function set(key, value) {
	        return define(this, key === 0 ? 0 : key, value);
	      }
	    } : {
	      // 23.2.3.1 Set.prototype.add(value)
	      add: function add(value) {
	        return define(this, value = value === 0 ? 0 : value, value);
	      }
	    });
	    if (descriptors) defineProperty$3(C.prototype, 'size', {
	      get: function () {
	        return getInternalState(this).size;
	      }
	    });
	    return C;
	  },
	  setStrong: function (C, CONSTRUCTOR_NAME, IS_MAP) {
	    var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
	    var getInternalCollectionState = internalStateGetterFor(CONSTRUCTOR_NAME);
	    var getInternalIteratorState = internalStateGetterFor(ITERATOR_NAME); // add .keys, .values, .entries, [@@iterator]
	    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11

	    defineIterator(C, CONSTRUCTOR_NAME, function (iterated, kind) {
	      setInternalState$2(this, {
	        type: ITERATOR_NAME,
	        target: iterated,
	        state: getInternalCollectionState(iterated),
	        kind: kind,
	        last: undefined
	      });
	    }, function () {
	      var state = getInternalIteratorState(this);
	      var kind = state.kind;
	      var entry = state.last; // revert to the last existing entry

	      while (entry && entry.removed) entry = entry.previous; // get next entry


	      if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
	        // or finish the iteration
	        state.target = undefined;
	        return {
	          value: undefined,
	          done: true
	        };
	      } // return step by kind


	      if (kind == 'keys') return {
	        value: entry.key,
	        done: false
	      };
	      if (kind == 'values') return {
	        value: entry.value,
	        done: false
	      };
	      return {
	        value: [entry.key, entry.value],
	        done: false
	      };
	    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true); // add [@@species], 23.1.2.2, 23.2.2.2

	    setSpecies(CONSTRUCTOR_NAME);
	  }
	};

	// https://tc39.github.io/ecma262/#sec-set-objects


	var es_set = collection('Set', function (init) {
	  return function Set() {
	    return init(this, arguments.length ? arguments[0] : undefined);
	  };
	}, collectionStrong);

	var charAt$1 = stringMultibyte.charAt;
	var STRING_ITERATOR = 'String Iterator';
	var setInternalState$3 = internalState.set;
	var getInternalState$2 = internalState.getterFor(STRING_ITERATOR); // `String.prototype[@@iterator]` method
	// https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator

	defineIterator(String, 'String', function (iterated) {
	  setInternalState$3(this, {
	    type: STRING_ITERATOR,
	    string: String(iterated),
	    index: 0
	  }); // `%StringIteratorPrototype%.next` method
	  // https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
	}, function next() {
	  var state = getInternalState$2(this);
	  var string = state.string;
	  var index = state.index;
	  var point;
	  if (index >= string.length) return {
	    value: undefined,
	    done: true
	  };
	  point = charAt$1(string, index);
	  state.index += point.length;
	  return {
	    value: point,
	    done: false
	  };
	});

	var arrayPush = [].push;
	var min$4 = Math.min;
	var MAX_UINT32 = 0xFFFFFFFF; // babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError

	var SUPPORTS_Y = !fails(function () {
	  return !RegExp(MAX_UINT32, 'y');
	}); // @@split logic

	fixRegexpWellKnownSymbolLogic('split', 2, function (SPLIT, nativeSplit, maybeCallNative) {
	  var internalSplit;

	  if ('abbc'.split(/(b)*/)[1] == 'c' || 'test'.split(/(?:)/, -1).length != 4 || 'ab'.split(/(?:ab)*/).length != 2 || '.'.split(/(.?)(.?)/).length != 4 || '.'.split(/()()/).length > 1 || ''.split(/.?/).length) {
	    // based on es5-shim implementation, need to rework it
	    internalSplit = function (separator, limit) {
	      var string = String(requireObjectCoercible(this));
	      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      if (lim === 0) return [];
	      if (separator === undefined) return [string]; // If `separator` is not a regex, use native split

	      if (!isRegexp(separator)) {
	        return nativeSplit.call(string, separator, lim);
	      }

	      var output = [];
	      var flags = (separator.ignoreCase ? 'i' : '') + (separator.multiline ? 'm' : '') + (separator.unicode ? 'u' : '') + (separator.sticky ? 'y' : '');
	      var lastLastIndex = 0; // Make `global` and avoid `lastIndex` issues by working with a copy

	      var separatorCopy = new RegExp(separator.source, flags + 'g');
	      var match, lastIndex, lastLength;

	      while (match = regexpExec.call(separatorCopy, string)) {
	        lastIndex = separatorCopy.lastIndex;

	        if (lastIndex > lastLastIndex) {
	          output.push(string.slice(lastLastIndex, match.index));
	          if (match.length > 1 && match.index < string.length) arrayPush.apply(output, match.slice(1));
	          lastLength = match[0].length;
	          lastLastIndex = lastIndex;
	          if (output.length >= lim) break;
	        }

	        if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
	      }

	      if (lastLastIndex === string.length) {
	        if (lastLength || !separatorCopy.test('')) output.push('');
	      } else output.push(string.slice(lastLastIndex));

	      return output.length > lim ? output.slice(0, lim) : output;
	    }; // Chakra, V8

	  } else if ('0'.split(undefined, 0).length) {
	    internalSplit = function (separator, limit) {
	      return separator === undefined && limit === 0 ? [] : nativeSplit.call(this, separator, limit);
	    };
	  } else internalSplit = nativeSplit;

	  return [// `String.prototype.split` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.split
	  function split(separator, limit) {
	    var O = requireObjectCoercible(this);
	    var splitter = separator == undefined ? undefined : separator[SPLIT];
	    return splitter !== undefined ? splitter.call(separator, O, limit) : internalSplit.call(String(O), separator, limit);
	  }, // `RegExp.prototype[@@split]` method
	  // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
	  //
	  // NOTE: This cannot be properly polyfilled in engines that don't support
	  // the 'y' flag.
	  function (regexp, limit) {
	    var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== nativeSplit);
	    if (res.done) return res.value;
	    var rx = anObject(regexp);
	    var S = String(this);
	    var C = speciesConstructor(rx, RegExp);
	    var unicodeMatching = rx.unicode;
	    var flags = (rx.ignoreCase ? 'i' : '') + (rx.multiline ? 'm' : '') + (rx.unicode ? 'u' : '') + (SUPPORTS_Y ? 'y' : 'g'); // ^(? + rx + ) is needed, in combination with some S slicing, to
	    // simulate the 'y' flag.

	    var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
	    var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	    if (lim === 0) return [];
	    if (S.length === 0) return regexpExecAbstract(splitter, S) === null ? [S] : [];
	    var p = 0;
	    var q = 0;
	    var A = [];

	    while (q < S.length) {
	      splitter.lastIndex = SUPPORTS_Y ? q : 0;
	      var z = regexpExecAbstract(splitter, SUPPORTS_Y ? S : S.slice(q));
	      var e;

	      if (z === null || (e = min$4(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p) {
	        q = advanceStringIndex(S, q, unicodeMatching);
	      } else {
	        A.push(S.slice(p, q));
	        if (A.length === lim) return A;

	        for (var i = 1; i <= z.length - 1; i++) {
	          A.push(z[i]);
	          if (A.length === lim) return A;
	        }

	        q = p = e;
	      }
	    }

	    A.push(S.slice(p));
	    return A;
	  }];
	}, !SUPPORTS_Y);

	// iterable DOM collections
	// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
	var domIterables = {
	  CSSRuleList: 0,
	  CSSStyleDeclaration: 0,
	  CSSValueList: 0,
	  ClientRectList: 0,
	  DOMRectList: 0,
	  DOMStringList: 0,
	  DOMTokenList: 1,
	  DataTransferItemList: 0,
	  FileList: 0,
	  HTMLAllCollection: 0,
	  HTMLCollection: 0,
	  HTMLFormElement: 0,
	  HTMLSelectElement: 0,
	  MediaList: 0,
	  MimeTypeArray: 0,
	  NamedNodeMap: 0,
	  NodeList: 1,
	  PaintRequestList: 0,
	  Plugin: 0,
	  PluginArray: 0,
	  SVGLengthList: 0,
	  SVGNumberList: 0,
	  SVGPathSegList: 0,
	  SVGPointList: 0,
	  SVGStringList: 0,
	  SVGTransformList: 0,
	  SourceBufferList: 0,
	  StyleSheetList: 0,
	  TextTrackCueList: 0,
	  TextTrackList: 0,
	  TouchList: 0
	};

	var ITERATOR$5 = wellKnownSymbol('iterator');
	var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');
	var ArrayValues = es_array_iterator.values;

	for (var COLLECTION_NAME in domIterables) {
	  var Collection = global_1[COLLECTION_NAME];
	  var CollectionPrototype = Collection && Collection.prototype;

	  if (CollectionPrototype) {
	    // some Chrome versions have non-configurable methods on DOMTokenList
	    if (CollectionPrototype[ITERATOR$5] !== ArrayValues) try {
	      createNonEnumerableProperty(CollectionPrototype, ITERATOR$5, ArrayValues);
	    } catch (error) {
	      CollectionPrototype[ITERATOR$5] = ArrayValues;
	    }

	    if (!CollectionPrototype[TO_STRING_TAG$3]) {
	      createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG$3, COLLECTION_NAME);
	    }

	    if (domIterables[COLLECTION_NAME]) for (var METHOD_NAME in es_array_iterator) {
	      // some Chrome versions have non-configurable methods on DOMTokenList
	      if (CollectionPrototype[METHOD_NAME] !== es_array_iterator[METHOD_NAME]) try {
	        createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, es_array_iterator[METHOD_NAME]);
	      } catch (error) {
	        CollectionPrototype[METHOD_NAME] = es_array_iterator[METHOD_NAME];
	      }
	    }
	  }
	}

	var Globals = {};

	var validIndexExtensionSet = new Set(['fai', 'bai', 'crai', 'tbi', 'idx']);

	var isValidIndexExtension = function isValidIndexExtension(path) {
	  // let set;
	  // set = new Set(['fai', 'bai', 'crai', 'tbi', 'idx']);
	  return validIndexExtensionSet.has(getExtension(path));
	};

	var getIndexObjectWithDataName = function getIndexObjectWithDataName(name) {
	  var extension, dataSuffix, lookup, indexObject, aa;
	  extension = getExtension(name);

	  if (false === isKnownFileExtension(extension)) {
	    return undefined;
	  }

	  dataSuffix = name.split('.').pop();
	  lookup = indexLookup(dataSuffix);
	  indexObject = {}; // aa

	  aa = name + '.' + lookup.index;
	  indexObject[aa] = {};
	  indexObject[aa].data = name;
	  indexObject[aa].isOptional = lookup.isOptional;

	  if ('bam' === extension || 'cram' === extension) {
	    var bb, parts; // bb

	    parts = name.split('.');
	    parts.pop();
	    bb = parts.join('.') + '.' + lookup.index;
	    indexObject[bb] = {};
	    indexObject[bb].data = name;
	    indexObject[bb].isOptional = lookup.isOptional;
	  }

	  return indexObject;
	};

	var isKnownFileExtension = function isKnownFileExtension(extension) {
	  var fasta = new Set(['fa', 'fasta']);
	  var union = new Set([].concat(_toConsumableArray(igv.knownFileExtensions), _toConsumableArray(fasta)));
	  return union.has(extension);
	};

	var getFilename = function getFilename(path) {
	  return path.google_url ? path.name : igv.getFilename(path);
	};

	var getExtension = function getExtension(path) {
	  return igv.getExtension({
	    url: path.google_url ? path.name : path
	  });
	};

	var configureModal = function configureModal(fileLoadWidget, $modal) {
	  var okHandler = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
	  var $dismiss, $ok; // upper dismiss - x - button

	  $dismiss = $modal.find('.modal-header button:nth-child(1)');
	  $dismiss.on('click', function () {
	    fileLoadWidget.dismiss();
	    $modal.modal('hide');
	  }); // lower dismiss - close - button

	  $dismiss = $modal.find('.modal-footer button:nth-child(1)');
	  $dismiss.on('click', function () {
	    fileLoadWidget.dismiss();
	    $modal.modal('hide');
	  }); // ok - button

	  $ok = $modal.find('.modal-footer button:nth-child(2)');
	  $ok.on('click', function () {
	    var status = true;

	    if (okHandler) {
	      status = okHandler(fileLoadWidget.fileLoadManager);
	    } else {
	      status = fileLoadWidget.fileLoadManager.okHandler();
	    }

	    if (true === status) {
	      fileLoadWidget.dismiss();
	      $modal.modal('hide');
	    }
	  });
	};

	var loadGenome = function loadGenome(genome) {
	  (function () {
	    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(genome) {
	      var g, e;
	      return regeneratorRuntime.wrap(function _callee$(_context) {
	        while (1) {
	          switch (_context.prev = _context.next) {
	            case 0:
	              g = undefined;
	              _context.prev = 1;
	              _context.next = 4;
	              return Globals.browser.loadGenome(genome);

	            case 4:
	              g = _context.sent;
	              _context.next = 10;
	              break;

	            case 7:
	              _context.prev = 7;
	              _context.t0 = _context["catch"](1);
	              alertPanel.presentAlert(_context.t0.message);

	            case 10:
	              if (!g) {
	                _context.next = 14;
	                break;
	              }

	              trackLoadController.updateTrackMenus(g.id);
	              _context.next = 17;
	              break;

	            case 14:
	              e = new Error("Unable to load genome ".concat(genome.name));
	              alertPanel.presentAlert(e.message);
	              throw e;

	            case 17:
	            case "end":
	              return _context.stop();
	          }
	        }
	      }, _callee, null, [[1, 7]]);
	    }));

	    return function (_x) {
	      return _ref.apply(this, arguments);
	    };
	  })()(genome);
	};

	var indexLookup = function indexLookup(dataSuffix) {
	  var fa = {
	    index: 'fai',
	    isOptional: false
	  };
	  var fasta = {
	    index: 'fai',
	    isOptional: false
	  };
	  var bam = {
	    index: 'bai',
	    isOptional: false
	  };
	  var cram = {
	    index: 'crai',
	    isOptional: false
	  };
	  var gz = {
	    index: 'tbi',
	    isOptional: true
	  };
	  var bgz = {
	    index: 'tbi',
	    isOptional: true
	  };
	  var any = {
	    index: 'idx',
	    isOptional: true
	  };
	  var lut = {
	    fa: fa,
	    fasta: fasta,
	    bam: bam,
	    cram: cram,
	    gz: gz,
	    bgz: bgz
	  };

	  if (lut[dataSuffix]) {
	    return lut[dataSuffix];
	  } else {
	    return any;
	  }
	};

	/*
	 * The MIT License (MIT)
	 *
	 * Copyright (c) 2016-2017 The Regents of the University of California
	 * Author: Jim Robinson
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
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 */
	//import igv from '../node_modules/igv/dist/igv.esm.min.js';
	var FileLoadWidget = /*#__PURE__*/function () {
	  function FileLoadWidget(config, fileLoadManager) {
	    _classCallCheck(this, FileLoadWidget);

	    var self = this,
	        obj;
	    this.config = config;

	    if (undefined === this.config.dataOnly) {
	      this.config.dataOnly = false;
	    }

	    this.config.dataTitle = config.dataTitle || 'Data';
	    this.config.indexTitle = config.indexTitle || 'Index';
	    this.$parent = config.$widgetParent;
	    this.fileLoadManager = fileLoadManager;
	    this.fileLoadManager.fileLoadWidget = this; // file load widget

	    this.$container = $('<div>', {
	      class: 'igv-file-load-widget-container'
	    });
	    this.$parent.append(this.$container);

	    if ('localFile' === config.mode) {
	      // local data/index
	      obj = {
	        doURL: false,
	        dataTitle: config.dataTitle + ' file',
	        indexTitle: config.indexTitle + ' file',
	        dataOnly: this.config.dataOnly
	      };
	    } else {
	      // url data/index
	      obj = {
	        doURL: true,
	        dataTitle: config.dataTitle + ' URL',
	        indexTitle: config.indexTitle + ' URL',
	        dataOnly: this.config.dataOnly
	      };
	    }

	    this.createInputContainer(this.$container, obj); // error message container

	    this.$error_message = $("<div>", {
	      class: "igv-flw-error-message-container"
	    });
	    this.$container.append(this.$error_message); // error message

	    this.$error_message.append($("<div>", {
	      class: "igv-flw-error-message"
	    })); // error dismiss button

	    igv.attachDialogCloseHandlerWithParent(this.$error_message, function () {
	      self.dismissErrorMessage();
	    });
	    this.dismissErrorMessage();
	  }

	  _createClass(FileLoadWidget, [{
	    key: "presentErrorMessage",
	    value: function presentErrorMessage(message) {
	      this.$error_message.find('.igv-flw-error-message').text(message);
	      this.$error_message.show();
	    }
	  }, {
	    key: "dismissErrorMessage",
	    value: function dismissErrorMessage() {
	      this.$error_message.hide();
	      this.$error_message.find('.igv-flw-error-message').text('');
	    }
	  }, {
	    key: "present",
	    value: function present() {
	      this.$container.show();
	    }
	  }, {
	    key: "dismiss",
	    value: function dismiss() {
	      this.dismissErrorMessage();
	      this.$container.find('input').val(undefined);
	      this.$container.find('.igv-flw-local-file-name-container').hide();
	      this.fileLoadManager.reset();
	    }
	  }, {
	    key: "customizeLayout",
	    value: function customizeLayout(customizer) {
	      customizer(this.$container);
	    }
	  }, {
	    key: "createInputContainer",
	    value: function createInputContainer($parent, config) {
	      var $container, $input_data_row, $input_index_row, $label; // container

	      $container = $("<div>", {
	        class: "igv-flw-input-container"
	      });
	      $parent.append($container); // data

	      $input_data_row = $("<div>", {
	        class: "igv-flw-input-row"
	      });
	      $container.append($input_data_row); // label

	      $label = $("<div>", {
	        class: "igv-flw-input-label"
	      });
	      $input_data_row.append($label);
	      $label.text(config.dataTitle);

	      if (true === config.doURL) {
	        this.createURLContainer($input_data_row, 'igv-flw-data-url', false);
	      } else {
	        this.createLocalFileContainer($input_data_row, 'igv-flw-local-data-file', false);
	      }

	      if (true === config.dataOnly) {
	        return;
	      } // index


	      $input_index_row = $("<div>", {
	        class: "igv-flw-input-row"
	      });
	      $container.append($input_index_row); // label

	      $label = $("<div>", {
	        class: "igv-flw-input-label"
	      });
	      $input_index_row.append($label);
	      $label.text(config.indexTitle);

	      if (true === config.doURL) {
	        this.createURLContainer($input_index_row, 'igv-flw-index-url', true);
	      } else {
	        this.createLocalFileContainer($input_index_row, 'igv-flw-local-index-file', true);
	      }
	    }
	  }, {
	    key: "createURLContainer",
	    value: function createURLContainer($parent, id, isIndexFile) {
	      var self = this,
	          $input;
	      $input = $('<input>', {
	        type: 'text',
	        placeholder: true === isIndexFile ? 'Enter index URL' : 'Enter data URL'
	      });
	      $parent.append($input);

	      if (isIndexFile) {
	        this.$inputIndex = $input;
	      } else {
	        this.$inputData = $input;
	      } // $input.on('focus', function () {
	      //     self.dismissErrorMessage();
	      // });
	      //
	      // $input.on('change', function (e) {
	      //     self.dismissErrorMessage();
	      //     self.fileLoadManager.inputHandler($(this).val(), isIndexFile);
	      // });


	      $parent.on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
	        e.preventDefault();
	        e.stopPropagation();
	        self.dismissErrorMessage();
	      }).on('dragover dragenter', function (e) {
	        $(this).addClass('igv-flw-input-row-hover-state');
	      }).on('dragleave dragend drop', function (e) {
	        $(this).removeClass('igv-flw-input-row-hover-state');
	      }).on('drop', function (e) {
	        if (false === self.fileLoadManager.didDragDrop(e.originalEvent.dataTransfer)) {
	          self.fileLoadManager.dragDropHandler(e.originalEvent.dataTransfer, isIndexFile);
	          var value = isIndexFile ? self.fileLoadManager.indexName() : self.fileLoadManager.dataName();
	          $input.val(value);
	        }
	      });
	    }
	  }, {
	    key: "createLocalFileContainer",
	    value: function createLocalFileContainer($parent, id, isIndexFile) {
	      var self = this,
	          $file_chooser_container,
	          $label,
	          $input,
	          $file_name,
	          str;
	      $file_chooser_container = $("<div>", {
	        class: "igv-flw-file-chooser-container"
	      });
	      $parent.append($file_chooser_container);
	      str = id + igv.guid();
	      $label = $('<label>', {
	        for: str
	      });
	      $file_chooser_container.append($label);
	      $label.text('Choose file');
	      $input = $('<input>', {
	        class: "igv-flw-file-chooser-input",
	        id: str,
	        name: str,
	        type: 'file'
	      });
	      $file_chooser_container.append($input);
	      $file_chooser_container.hover(function () {
	        $label.removeClass('igv-flw-label-color');
	        $label.addClass('igv-flw-label-color-hover');
	      }, function () {
	        $label.removeClass('igv-flw-label-color-hover');
	        $label.addClass('igv-flw-label-color');
	      });
	      $file_name = $("<div>", {
	        class: "igv-flw-local-file-name-container"
	      });
	      $parent.append($file_name);
	      $file_name.hide();
	      $input.on('change', function (e) {
	        self.dismissErrorMessage();
	        self.fileLoadManager.inputHandler(e.target.files[0], isIndexFile);
	        $file_name.text(e.target.files[0].name);
	        $file_name.attr('title', e.target.files[0].name);
	        $file_name.show();
	      });
	      $parent.on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
	        e.preventDefault();
	        e.stopPropagation();
	        self.dismissErrorMessage();
	      }).on('dragover dragenter', function (e) {
	        $(this).addClass('igv-flw-input-row-hover-state');
	      }).on('dragleave dragend drop', function (e) {
	        $(this).removeClass('igv-flw-input-row-hover-state');
	      }).on('drop', function (e) {
	        var str;

	        if (true === self.fileLoadManager.didDragDrop(e.originalEvent.dataTransfer)) {
	          self.fileLoadManager.dragDropHandler(e.originalEvent.dataTransfer, isIndexFile);
	          str = isIndexFile ? self.fileLoadManager.indexName() : self.fileLoadManager.dataName();
	          $file_name.text(str);
	          $file_name.attr('title', str);
	          $file_name.show();
	        }
	      });
	    }
	  }]);

	  return FileLoadWidget;
	}();

	// a string of all valid unicode whitespaces
	// eslint-disable-next-line max-len
	var whitespaces = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

	var whitespace = '[' + whitespaces + ']';
	var ltrim = RegExp('^' + whitespace + whitespace + '*');
	var rtrim = RegExp(whitespace + whitespace + '*$'); // `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation

	var createMethod$3 = function (TYPE) {
	  return function ($this) {
	    var string = String(requireObjectCoercible($this));
	    if (TYPE & 1) string = string.replace(ltrim, '');
	    if (TYPE & 2) string = string.replace(rtrim, '');
	    return string;
	  };
	};

	var stringTrim = {
	  // `String.prototype.{ trimLeft, trimStart }` methods
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trimstart
	  start: createMethod$3(1),
	  // `String.prototype.{ trimRight, trimEnd }` methods
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trimend
	  end: createMethod$3(2),
	  // `String.prototype.trim` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trim
	  trim: createMethod$3(3)
	};

	var non = '\u200B\u0085\u180E'; // check that a method works with the correct list
	// of whitespaces and has a correct name

	var stringTrimForced = function (METHOD_NAME) {
	  return fails(function () {
	    return !!whitespaces[METHOD_NAME]() || non[METHOD_NAME]() != non || whitespaces[METHOD_NAME].name !== METHOD_NAME;
	  });
	};

	var $trim = stringTrim.trim; // `String.prototype.trim` method
	// https://tc39.github.io/ecma262/#sec-string.prototype.trim

	_export({
	  target: 'String',
	  proto: true,
	  forced: stringTrimForced('trim')
	}, {
	  trim: function trim() {
	    return $trim(this);
	  }
	});

	var FileLoadManager = /*#__PURE__*/function () {
	  function FileLoadManager() {
	    _classCallCheck(this, FileLoadManager);

	    this.dictionary = {};
	  }

	  _createClass(FileLoadManager, [{
	    key: "inputHandler",
	    value: function inputHandler(path, isIndexFile) {
	      this.ingestPath(path, isIndexFile);
	    }
	  }, {
	    key: "getPaths",
	    value: function getPaths() {
	      var paths = [];
	      this.ingestPaths();

	      if (this.dictionary) {
	        if (this.dictionary.data) {
	          paths.push(this.dictionary.data);
	        }

	        if (this.dictionary.index) {
	          paths.push(this.dictionary.index);
	        }
	      }

	      return paths;
	    }
	  }, {
	    key: "ingestPaths",
	    value: function ingestPaths() {
	      this.ingestPath(this.fileLoadWidget.$inputData.val(), false);

	      if (this.fileLoadWidget.$inputIndex) {
	        this.ingestPath(this.fileLoadWidget.$inputIndex.val(), true);
	      }
	    }
	  }, {
	    key: "ingestPath",
	    value: function ingestPath(path, isIndexFile) {
	      var key = true === isIndexFile ? 'index' : 'data';
	      this.dictionary[key] = path.trim();
	    }
	  }, {
	    key: "didDragDrop",
	    value: function didDragDrop(dataTransfer) {
	      var files;
	      files = dataTransfer.files;
	      return files && files.length > 0;
	    }
	  }, {
	    key: "dragDropHandler",
	    value: function dragDropHandler(dataTransfer, isIndexFile) {
	      var url, files;
	      url = dataTransfer.getData('text/uri-list');
	      files = dataTransfer.files;

	      if (files && files.length > 0) {
	        this.ingestPath(files[0], isIndexFile);
	      } else if (url && '' !== url) {
	        this.ingestPath(url, isIndexFile);
	      }
	    }
	  }, {
	    key: "indexName",
	    value: function indexName() {
	      return itemName(this.dictionary.index);
	    }
	  }, {
	    key: "dataName",
	    value: function dataName() {
	      return itemName(this.dictionary.data);
	    }
	  }, {
	    key: "reset",
	    value: function reset() {
	      this.dictionary = {};
	    }
	  }]);

	  return FileLoadManager;
	}();

	function itemName(item) {
	  return igv.isFilePath(item) ? item.name : item;
	}

	var GenomeLoadController = /*#__PURE__*/function () {
	  function GenomeLoadController(browser, _ref) {
	    var $urlModal = _ref.$urlModal,
	        genomes = _ref.genomes,
	        uberFileLoader = _ref.uberFileLoader;

	    _classCallCheck(this, GenomeLoadController);

	    this.genomes = genomes; // URL

	    var urlConfig = {
	      dataTitle: 'Genome',
	      $widgetParent: $urlModal.find('.modal-body'),
	      mode: 'url'
	    };
	    this.urlWidget = new FileLoadWidget(urlConfig, new FileLoadManager());
	    configureModal(this.urlWidget, $urlModal, function (fileLoadManager) {
	      uberFileLoader.ingestPaths(fileLoadManager.getPaths());
	      return true;
	    });
	  }

	  _createClass(GenomeLoadController, [{
	    key: "getAppLaunchGenomes",
	    value: function () {
	      var _getAppLaunchGenomes = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
	        var response, json;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                if (!(undefined === this.genomes)) {
	                  _context.next = 2;
	                  break;
	                }

	                return _context.abrupt("return", undefined);

	              case 2:
	                if (!Array.isArray(this.genomes)) {
	                  _context.next = 6;
	                  break;
	                }

	                return _context.abrupt("return", buildDictionary(this.genomes));

	              case 6:
	                response = undefined;
	                _context.prev = 7;
	                _context.next = 10;
	                return fetch(this.genomes);

	              case 10:
	                response = _context.sent;
	                _context.next = 16;
	                break;

	              case 13:
	                _context.prev = 13;
	                _context.t0 = _context["catch"](7);
	                alertPanel.presentAlert(_context.t0.message);

	              case 16:
	                if (!response) {
	                  _context.next = 21;
	                  break;
	                }

	                _context.next = 19;
	                return response.json();

	              case 19:
	                json = _context.sent;
	                return _context.abrupt("return", buildDictionary(json));

	              case 21:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[7, 13]]);
	      }));

	      function getAppLaunchGenomes() {
	        return _getAppLaunchGenomes.apply(this, arguments);
	      }

	      return getAppLaunchGenomes;
	    }()
	  }]);

	  return GenomeLoadController;
	}();

	var buildDictionary = function buildDictionary(array) {
	  var dictionary = {};

	  if (true === Array.isArray(array)) {
	    var _iterator = _createForOfIteratorHelper(array),
	        _step;

	    try {
	      for (_iterator.s(); !(_step = _iterator.n()).done;) {
	        var json = _step.value;
	        dictionary[json.id] = json;
	      }
	    } catch (err) {
	      _iterator.e(err);
	    } finally {
	      _iterator.f();
	    }
	  } else {
	    dictionary[array.id] = array;
	  }

	  return dictionary;
	};

	function genomeDropdownLayout(_ref2) {
	  var browser = _ref2.browser,
	      genomeDictionary = _ref2.genomeDictionary,
	      $dropdown_menu = _ref2.$dropdown_menu;
	  // discard all buttons preceeding the divider div
	  var $divider = $dropdown_menu.find('#igv-app-genome-dropdown-divider');
	  $divider.prevAll().remove();

	  for (var key in genomeDictionary) {
	    if (genomeDictionary.hasOwnProperty(key)) {
	      (function () {
	        var $button = createButton(genomeDictionary[key].name);
	        $button.insertBefore($divider);
	        $button.data('id', key);
	        var str = "click.genome-dropdown.".concat(key);
	        $button.on(str, function () {
	          var id = $button.data('id');

	          if (id !== browser.genome.id) {
	            loadGenome(genomeDictionary[id]);
	          }
	        });
	      })();
	    } // if (...)

	  } // for (...)


	  function createButton(title) {
	    var $button = $('<button>', {
	      class: 'dropdown-item',
	      type: 'button'
	    });
	    $button.text(title);
	    return $button;
	  }
	}

	var $filter = arrayIteration.filter;
	var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport('filter'); // Edge 14- issue

	var USES_TO_LENGTH$3 = arrayMethodUsesToLength('filter'); // `Array.prototype.filter` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.filter
	// with adding support of @@species

	_export({
	  target: 'Array',
	  proto: true,
	  forced: !HAS_SPECIES_SUPPORT$1 || !USES_TO_LENGTH$3
	}, {
	  filter: function filter(callbackfn
	  /* , thisArg */
	  ) {
	    return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var $forEach = arrayIteration.forEach;
	var STRICT_METHOD$2 = arrayMethodIsStrict('forEach');
	var USES_TO_LENGTH$4 = arrayMethodUsesToLength('forEach'); // `Array.prototype.forEach` method implementation
	// https://tc39.github.io/ecma262/#sec-array.prototype.foreach

	var arrayForEach = !STRICT_METHOD$2 || !USES_TO_LENGTH$4 ? function forEach(callbackfn
	/* , thisArg */
	) {
	  return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	} : [].forEach;

	// https://tc39.github.io/ecma262/#sec-array.prototype.foreach


	_export({
	  target: 'Array',
	  proto: true,
	  forced: [].forEach != arrayForEach
	}, {
	  forEach: arrayForEach
	});

	// https://tc39.github.io/ecma262/#sec-array.from


	var arrayFrom = function from(arrayLike
	/* , mapfn = undefined, thisArg = undefined */
	) {
	  var O = toObject(arrayLike);
	  var C = typeof this == 'function' ? this : Array;
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var mapping = mapfn !== undefined;
	  var iteratorMethod = getIteratorMethod(O);
	  var index = 0;
	  var length, result, step, iterator, next, value;
	  if (mapping) mapfn = functionBindContext(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2); // if the target is not iterable or it's an array with the default iterator - use a simple case

	  if (iteratorMethod != undefined && !(C == Array && isArrayIteratorMethod(iteratorMethod))) {
	    iterator = iteratorMethod.call(O);
	    next = iterator.next;
	    result = new C();

	    for (; !(step = next.call(iterator)).done; index++) {
	      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
	      createProperty(result, index, value);
	    }
	  } else {
	    length = toLength(O.length);
	    result = new C(length);

	    for (; length > index; index++) {
	      value = mapping ? mapfn(O[index], index) : O[index];
	      createProperty(result, index, value);
	    }
	  }

	  result.length = index;
	  return result;
	};

	var INCORRECT_ITERATION$1 = !checkCorrectnessOfIteration(function (iterable) {
	  Array.from(iterable);
	}); // `Array.from` method
	// https://tc39.github.io/ecma262/#sec-array.from

	_export({
	  target: 'Array',
	  stat: true,
	  forced: INCORRECT_ITERATION$1
	}, {
	  from: arrayFrom
	});

	var $includes = arrayIncludes.includes;
	var USES_TO_LENGTH$5 = arrayMethodUsesToLength('indexOf', {
	  ACCESSORS: true,
	  1: 0
	}); // `Array.prototype.includes` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.includes

	_export({
	  target: 'Array',
	  proto: true,
	  forced: !USES_TO_LENGTH$5
	}, {
	  includes: function includes(el
	  /* , fromIndex = 0 */
	  ) {
	    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
	  }
	}); // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

	addToUnscopables('includes');

	var $map = arrayIteration.map;
	var HAS_SPECIES_SUPPORT$2 = arrayMethodHasSpeciesSupport('map'); // FF49- issue

	var USES_TO_LENGTH$6 = arrayMethodUsesToLength('map'); // `Array.prototype.map` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.map
	// with adding support of @@species

	_export({
	  target: 'Array',
	  proto: true,
	  forced: !HAS_SPECIES_SUPPORT$2 || !USES_TO_LENGTH$6
	}, {
	  map: function map(callbackfn
	  /* , thisArg */
	  ) {
	    return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var createMethod$4 = function (IS_RIGHT) {
	  return function (that, callbackfn, argumentsLength, memo) {
	    aFunction$1(callbackfn);
	    var O = toObject(that);
	    var self = indexedObject(O);
	    var length = toLength(O.length);
	    var index = IS_RIGHT ? length - 1 : 0;
	    var i = IS_RIGHT ? -1 : 1;
	    if (argumentsLength < 2) while (true) {
	      if (index in self) {
	        memo = self[index];
	        index += i;
	        break;
	      }

	      index += i;

	      if (IS_RIGHT ? index < 0 : length <= index) {
	        throw TypeError('Reduce of empty array with no initial value');
	      }
	    }

	    for (; IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) {
	      memo = callbackfn(memo, self[index], index, O);
	    }

	    return memo;
	  };
	};

	var arrayReduce = {
	  // `Array.prototype.reduce` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.reduce
	  left: createMethod$4(false),
	  // `Array.prototype.reduceRight` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.reduceright
	  right: createMethod$4(true)
	};

	var $reduce = arrayReduce.left;
	var STRICT_METHOD$3 = arrayMethodIsStrict('reduce');
	var USES_TO_LENGTH$7 = arrayMethodUsesToLength('reduce', {
	  1: 0
	}); // `Array.prototype.reduce` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.reduce

	_export({
	  target: 'Array',
	  proto: true,
	  forced: !STRICT_METHOD$3 || !USES_TO_LENGTH$7
	}, {
	  reduce: function reduce(callbackfn
	  /* , initialValue */
	  ) {
	    return $reduce(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var FAILS_ON_PRIMITIVES = fails(function () {
	  objectKeys(1);
	}); // `Object.keys` method
	// https://tc39.github.io/ecma262/#sec-object.keys

	_export({
	  target: 'Object',
	  stat: true,
	  forced: FAILS_ON_PRIMITIVES
	}, {
	  keys: function keys(it) {
	    return objectKeys(toObject(it));
	  }
	});

	// https://tc39.github.io/ecma262/#sec-string.prototype.includes


	_export({
	  target: 'String',
	  proto: true,
	  forced: !correctIsRegexpLogic('includes')
	}, {
	  includes: function includes(searchString
	  /* , position = 0 */
	  ) {
	    return !!~String(requireObjectCoercible(this)).indexOf(notARegexp(searchString), arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var quot = /"/g; // B.2.3.2.1 CreateHTML(string, tag, attribute, value)
	// https://tc39.github.io/ecma262/#sec-createhtml

	var createHtml = function (string, tag, attribute, value) {
	  var S = String(requireObjectCoercible(string));
	  var p1 = '<' + tag;
	  if (attribute !== '') p1 += ' ' + attribute + '="' + String(value).replace(quot, '&quot;') + '"';
	  return p1 + '>' + S + '</' + tag + '>';
	};

	// of a tag and escaping quotes in arguments

	var stringHtmlForced = function (METHOD_NAME) {
	  return fails(function () {
	    var test = ''[METHOD_NAME]('"');
	    return test !== test.toLowerCase() || test.split('"').length > 3;
	  });
	};

	// https://tc39.github.io/ecma262/#sec-string.prototype.link


	_export({
	  target: 'String',
	  proto: true,
	  forced: stringHtmlForced('link')
	}, {
	  link: function link(url) {
	    return createHtml(this, 'a', 'href', url);
	  }
	});

	for (var COLLECTION_NAME$1 in domIterables) {
	  var Collection$1 = global_1[COLLECTION_NAME$1];
	  var CollectionPrototype$1 = Collection$1 && Collection$1.prototype; // some Chrome versions have non-configurable methods on DOMTokenList

	  if (CollectionPrototype$1 && CollectionPrototype$1.forEach !== arrayForEach) try {
	    createNonEnumerableProperty(CollectionPrototype$1, 'forEach', arrayForEach);
	  } catch (error) {
	    CollectionPrototype$1.forEach = arrayForEach;
	  }
	}

	var indexableFormats = new Set(["vcf", "bed", "gff", "gtf", "gff3", "bedgraph"]);

	var MultipleFileLoadController = /*#__PURE__*/function () {
	  function MultipleFileLoadController(browser, config) {
	    _classCallCheck(this, MultipleFileLoadController);

	    this.browser = browser;
	    this.config = config;

	    if (undefined === this.config.multipleFileSelection) {
	      this.config.multipleFileSelection = true;
	    }

	    this.pathValidator = config.pathValidator;
	    this.jsonFileValidator = config.jsonFileValidator;
	    this.fileLoadHander = config.fileLoadHandler;
	    this.configurationHandler = config.configurationHandler;
	    this.$modal = config.$modal;
	    this.$modal_body = this.$modal.find('.modal-body');
	    this.createLocalInput(config.$localFileInput);
	    this.createDropboxButton(config.$dropboxButton, config.multipleFileSelection);

	    if (config.$googleDriveButton) {
	      this.createGoogleDriveButton(config.$googleDriveButton, config.multipleFileSelection);
	    }
	  }

	  _createClass(MultipleFileLoadController, [{
	    key: "ingestPaths",
	    value: function () {
	      var _ingestPaths = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(paths) {
	        var self, dataPaths, indexPathCandidates, indexPaths, indexPathNameSet, indexPathNamesLackingDataPaths, jsonPromises, configurations, tmp, googleDrivePaths, _iterator, _step, _path2, fileInfo, jsonPaths, remainingPaths, jsons, booleans, invalids, json, path, o, xmlPaths, _path, _o, extensions, results, invalid, key;

	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                self = this; // handle Google Drive paths (not already handled via Google Drive Picker)

	                tmp = [];
	                googleDrivePaths = [];
	                _iterator = _createForOfIteratorHelper(paths);
	                _context.prev = 4;

	                _iterator.s();

	              case 6:
	                if ((_step = _iterator.n()).done) {
	                  _context.next = 22;
	                  break;
	                }

	                _path2 = _step.value;

	                if (!igv.isFilePath(_path2)) {
	                  _context.next = 12;
	                  break;
	                }

	                tmp.push(_path2);
	                _context.next = 20;
	                break;

	              case 12:
	                if (!(undefined === _path2.google_url && _path2.includes('drive.google.com'))) {
	                  _context.next = 19;
	                  break;
	                }

	                _context.next = 15;
	                return igv.google.getDriveFileInfo(_path2);

	              case 15:
	                fileInfo = _context.sent;
	                googleDrivePaths.push({
	                  filename: fileInfo.name,
	                  name: fileInfo.name,
	                  google_url: _path2
	                });
	                _context.next = 20;
	                break;

	              case 19:
	                tmp.push(_path2);

	              case 20:
	                _context.next = 6;
	                break;

	              case 22:
	                _context.next = 27;
	                break;

	              case 24:
	                _context.prev = 24;
	                _context.t0 = _context["catch"](4);

	                _iterator.e(_context.t0);

	              case 27:
	                _context.prev = 27;

	                _iterator.f();

	                return _context.finish(27);

	              case 30:
	                paths = tmp.concat(googleDrivePaths); // isolate JSON paths

	                jsonPaths = paths.filter(function (path) {
	                  return 'json' === getExtension(path);
	                });

	                if (!(jsonPaths.length > 0)) {
	                  _context.next = 50;
	                  break;
	                }

	                // accumulate JSON retrieval Promises
	                jsonPromises = jsonPaths.map(function (path) {
	                  var url = path.google_url || path;
	                  return {
	                    name: getFilename(path),
	                    promise: igv.xhr.loadJson(url)
	                  };
	                }); // validate JSON

	                _context.next = 36;
	                return Promise.all(jsonPromises.map(function (task) {
	                  return task.promise;
	                }));

	              case 36:
	                jsons = _context.sent;
	                booleans = jsons.map(function (json) {
	                  return self.jsonFileValidator(json);
	                });
	                invalids = booleans.map(function (boolean, index) {
	                  return {
	                    isValid: boolean,
	                    path: jsonPaths[index]
	                  };
	                }).filter(function (o) {
	                  return false === o.isValid;
	                });

	                if (!(invalids.length > 0)) {
	                  _context.next = 42;
	                  break;
	                }

	                this.presentInvalidFiles(invalids.map(function (o) {
	                  return o.path;
	                }));
	                return _context.abrupt("return");

	              case 42:
	                // Handle Session file. There can only be ONE.
	                json = jsons.pop();

	                if (!(true === MultipleFileLoadController.sessionJSONValidator(json))) {
	                  _context.next = 47;
	                  break;
	                }

	                path = jsonPaths.pop();

	                if (path.google_url) {
	                  this.browser.loadSession({
	                    url: path.google_url,
	                    filename: path.name
	                  });
	                } else {
	                  o = {};
	                  o.filename = getFilename(path);

	                  if (true === igv.isFilePath(path)) {
	                    o.file = path;
	                  } else {
	                    o.url = path;
	                  }

	                  this.browser.loadSession(o);
	                }

	                return _context.abrupt("return");

	              case 47:
	                // non-JSON paths
	                remainingPaths = paths.filter(function (path) {
	                  return 'json' !== getExtension(path);
	                });
	                _context.next = 51;
	                break;

	              case 50:
	                // there are no JSON paths
	                remainingPaths = paths;

	              case 51:
	                if (!(0 === jsonPaths.length && 0 === remainingPaths.length)) {
	                  _context.next = 54;
	                  break;
	                }

	                alertPanel.presentAlert("ERROR: No valid data files submitted");
	                return _context.abrupt("return");

	              case 54:
	                // Isolate XML paths. We only care about one and we assume it is a session path
	                xmlPaths = remainingPaths.filter(function (path) {
	                  return 'xml' === getExtension(path);
	                });

	                if (!(xmlPaths.length > 0)) {
	                  _context.next = 62;
	                  break;
	                }

	                _path = xmlPaths.pop();
	                _o = {};
	                _o.filename = getFilename(_path);

	                if (true === igv.isFilePath(_path)) {
	                  _o.file = _path;
	                } else {
	                  _o.url = _path.google_url || _path;
	                }

	                this.browser.loadSession(_o);
	                return _context.abrupt("return");

	              case 62:
	                // validate data paths (non-JSON)
	                extensions = remainingPaths.map(function (path) {
	                  return getExtension(path);
	                });

	                if (!(extensions.length > 0)) {
	                  _context.next = 70;
	                  break;
	                }

	                results = extensions.map(function (extension) {
	                  return self.pathValidator(extension);
	                });

	                if (!(results.length > 0)) {
	                  _context.next = 70;
	                  break;
	                }

	                invalid = results.map(function (boolean, index) {
	                  return {
	                    isValid: boolean,
	                    path: remainingPaths[index]
	                  };
	                }).filter(function (obj) {
	                  return false === obj.isValid;
	                });

	                if (!(invalid.length > 0)) {
	                  _context.next = 70;
	                  break;
	                }

	                this.presentInvalidFiles(invalid.map(function (o) {
	                  return o.path;
	                }));
	                return _context.abrupt("return");

	              case 70:
	                // isolate data paths in dictionary
	                dataPaths = createDataPathDictionary(remainingPaths); // isolate index path candidates in dictionary

	                indexPathCandidates = createIndexPathCandidateDictionary(remainingPaths); // identify index paths that are
	                // 1) present
	                // 2) names of missing index paths for later error reporting

	                indexPaths = getIndexPaths(dataPaths, indexPathCandidates);
	                indexPathNameSet = new Set();

	                for (key in indexPaths) {
	                  if (indexPaths.hasOwnProperty(key)) {
	                    indexPaths[key].forEach(function (obj) {
	                      if (obj) {
	                        indexPathNameSet.add(obj.name);
	                      }
	                    });
	                  }
	                }

	                indexPathNamesLackingDataPaths = Object.keys(indexPathCandidates).reduce(function (accumulator, key) {
	                  if (false === indexPathNameSet.has(key)) {
	                    accumulator.push(key);
	                  }

	                  return accumulator;
	                }, []);
	                configurations = Object.keys(dataPaths).reduce(function (accumulator, key) {
	                  if (false === dataPathIsMissingIndexPath(key, indexPaths)) {
	                    accumulator.push(self.configurationHandler(key, dataPaths[key], indexPaths));
	                  }

	                  return accumulator;
	                }, []);

	                if (jsonPaths.length > 0) {
	                  this.jsonRetrievalSerial(jsonPromises, configurations, dataPaths, indexPaths, indexPathNamesLackingDataPaths);
	                } else {
	                  if (configurations.length > 0) {
	                    this.fileLoadHander(configurations);
	                  }

	                  this.renderTrackFileSelection(dataPaths, indexPaths, indexPathNamesLackingDataPaths, new Set());
	                }

	              case 78:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[4, 24, 27, 30]]);
	      }));

	      function ingestPaths(_x) {
	        return _ingestPaths.apply(this, arguments);
	      }

	      return ingestPaths;
	    }()
	  }, {
	    key: "createLocalInput",
	    value: function createLocalInput($input) {
	      var self = this;
	      $input.on('change', function () {
	        if (true === MultipleFileLoadController.isValidLocalFileInput($(this))) {
	          var input = $(this).get(0);
	          var list = Array.from(input.files);
	          input.value = '';
	          self.ingestPaths(list);
	        }
	      });
	    }
	  }, {
	    key: "createDropboxButton",
	    value: function createDropboxButton($dropboxButton, multipleFileSelection) {
	      var self = this;
	      $dropboxButton.on('click', function () {
	        var obj;
	        obj = {
	          success: function success(dbFiles) {
	            return self.ingestPaths(dbFiles.map(function (dbFile) {
	              return dbFile.link;
	            }));
	          },
	          cancel: function cancel() {},
	          linkType: "preview",
	          multiselect: multipleFileSelection,
	          folderselect: false
	        };
	        Dropbox.choose(obj);
	      });
	    }
	  }, {
	    key: "createGoogleDriveButton",
	    value: function createGoogleDriveButton($button, multipleFileSelection) {
	      var self = this,
	          paths;
	      $button.on('click', function () {
	        createDropdownButtonPicker(multipleFileSelection, function (googleDriveResponses) {
	          // paths = googleDriveResponses.map((response) => ({ name: response.name, google_url: response.url }));
	          paths = googleDriveResponses.map(function (response) {
	            var result = {
	              filename: response.name,
	              name: response.name,
	              google_url: response.url
	            };
	            return result;
	          });
	          self.ingestPaths(paths);
	        });
	      });
	    }
	  }, {
	    key: "jsonRetrievalParallel",
	    value: function jsonRetrievalParallel(retrievalTasks, configurations, dataPaths, indexPaths, indexPathNamesLackingDataPaths) {
	      var self = this;
	      Promise.all(retrievalTasks.map(function (task) {
	        return task.promise;
	      })).then(function (list) {
	        if (list && list.length > 0) {
	          var jsonConfigurations;
	          jsonConfigurations = list.reduce(function (accumulator, item) {
	            if (true === Array.isArray(item)) {
	              item.forEach(function (config) {
	                accumulator.push(config);
	              });
	            } else {
	              accumulator.push(item);
	            }

	            return accumulator;
	          }, []);
	          configurations.push.apply(configurations, jsonConfigurations);
	          self.fileLoadHander(configurations);
	          self.renderTrackFileSelection(dataPaths, indexPaths, indexPathNamesLackingDataPaths, new Set());
	        } else {
	          self.renderTrackFileSelection(dataPaths, indexPaths, indexPathNamesLackingDataPaths, new Set());
	        }
	      }).catch(function (error) {
	        self.renderTrackFileSelection(dataPaths, indexPaths, indexPathNamesLackingDataPaths, new Set());
	      });
	    }
	  }, {
	    key: "jsonRetrievalSerial",
	    value: function jsonRetrievalSerial(retrievalTasks, configurations, dataPaths, indexPaths, indexPathNamesLackingDataPaths) {
	      var self = this,
	          taskSet,
	          successSet,
	          jsonConfigurations;
	      taskSet = new Set(retrievalTasks.map(function (task) {
	        return task.name;
	      }));
	      successSet = new Set();
	      jsonConfigurations = [];
	      retrievalTasks.reduce(function (promiseChain, task) {
	        return promiseChain.then(function (chainResults) {
	          var promise;
	          promise = task.promise;
	          return promise.then(function (currentResult) {
	            successSet.add(task.name);
	            jsonConfigurations = [].concat(_toConsumableArray(chainResults), [currentResult]);
	            return jsonConfigurations;
	          });
	        });
	      }, Promise.resolve([])).then(function (ignore) {
	        self.jsonConfigurator(dataPaths, indexPaths, indexPathNamesLackingDataPaths, jsonConfigurations, configurations, taskSet, successSet);
	      }).catch(function (error) {
	        self.jsonConfigurator(dataPaths, indexPaths, indexPathNamesLackingDataPaths, jsonConfigurations, configurations, taskSet, successSet);
	      });
	    }
	  }, {
	    key: "renderTrackFileSelection",
	    value: function renderTrackFileSelection(dataPaths, indexPaths, indexPathNamesLackingDataPaths, jsonFailureNameSet) {
	      var markup;
	      markup = Object.keys(dataPaths).reduce(function (accumulator, name) {
	        if (true === dataPathIsMissingIndexPath(name, indexPaths)) {
	          accumulator.push('<div><span>&nbsp;&nbsp;&nbsp;&nbsp;' + name + '</span>' + '&nbsp;&nbsp;&nbsp;ERROR: index file must also be selected</div>');
	        }

	        return accumulator;
	      }, []);
	      indexPathNamesLackingDataPaths.forEach(function (name) {
	        markup.push('<div><span>&nbsp;&nbsp;&nbsp;&nbsp;' + name + '</span>' + '&nbsp;&nbsp;&nbsp;ERROR: data file must also be selected</div>');
	      });
	      jsonFailureNameSet.forEach(function (name) {
	        markup.push('<div><span>&nbsp;&nbsp;&nbsp;&nbsp;' + name + '</span>' + '&nbsp;&nbsp;&nbsp;ERROR: problems parsing JSON</div>');
	      });

	      if (markup.length > 0) {
	        var header;
	        header = '<div> The following files were not loaded ...</div>';
	        markup.unshift(header);
	        this.$modal.find('.modal-title').text(this.config.modalTitle);
	        this.$modal_body.empty();
	        this.$modal_body.append(markup.join(''));
	        this.$modal.modal('show');
	      }
	    }
	  }, {
	    key: "jsonConfigurator",
	    value: function jsonConfigurator(dataPaths, indexPaths, indexPathNamesLackingDataPaths, jsonConfigurations, configurations, taskSet, successSet) {
	      var self = this,
	          failureSet;

	      if (jsonConfigurations.length > 0) {
	        var reduction;
	        reduction = jsonConfigurations.reduce(function (accumulator, item) {
	          if (true === Array.isArray(item)) {
	            item.forEach(function (config) {
	              accumulator.push(config);
	            });
	          } else {
	            accumulator.push(item);
	          }

	          return accumulator;
	        }, []);
	        configurations.push.apply(configurations, reduction);
	        self.fileLoadHander(configurations);
	        failureSet = _toConsumableArray(taskSet).filter(function (x) {
	          return !successSet.has(x);
	        });
	        self.renderTrackFileSelection(dataPaths, indexPaths, indexPathNamesLackingDataPaths, failureSet);
	      } else {
	        if (configurations.length > 0) {
	          self.fileLoadHander(configurations);
	        }

	        failureSet = _toConsumableArray(taskSet).filter(function (x) {
	          return !successSet.has(x);
	        });
	        self.renderTrackFileSelection(dataPaths, indexPaths, indexPathNamesLackingDataPaths, failureSet);
	      }
	    }
	  }, {
	    key: "presentInvalidFiles",
	    value: function presentInvalidFiles(paths) {
	      var markup = [];
	      var header = '<div> Invalid Files </div>';
	      markup.push(header);

	      var _iterator2 = _createForOfIteratorHelper(paths),
	          _step2;

	      try {
	        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	          var path = _step2.value;
	          var name = getFilename(path);
	          markup.push('<div><span>' + name + '</span>' + '</div>');
	        }
	      } catch (err) {
	        _iterator2.e(err);
	      } finally {
	        _iterator2.f();
	      }

	      this.$modal.find('.modal-title').text(this.config.modalTitle);
	      this.$modal_body.empty();
	      this.$modal_body.append(markup.join(''));
	      this.$modal.modal('show');
	    }
	  }], [{
	    key: "isValidLocalFileInput",
	    value: function isValidLocalFileInput($input) {
	      return $input.get(0).files && $input.get(0).files.length > 0;
	    } //

	  }, {
	    key: "trackConfigurator",
	    value: function trackConfigurator(dataKey, dataValue, indexPaths) {
	      var config;
	      config = {
	        name: dataKey,
	        filename: dataKey,
	        format: igv.inferFileFormat(dataKey),
	        url: dataValue,
	        indexURL: getIndexURL(indexPaths[dataKey])
	      };
	      var indexURL = getIndexURL(indexPaths[dataKey]);

	      if (indexURL) {
	        config.indexURL = indexURL;
	      } else {
	        if (indexableFormats.has(config.format)) {
	          config.indexed = false;
	        }
	      }

	      igv.inferTrackTypes(config);
	      return config;
	    }
	  }, {
	    key: "genomeConfigurator",
	    value: function genomeConfigurator(dataKey, dataValue, indexPaths) {
	      var config;
	      config = {
	        fastaURL: dataValue,
	        indexURL: getIndexURL(indexPaths[dataKey])
	      };
	      return config;
	    }
	  }, {
	    key: "sessionConfigurator",
	    value: function sessionConfigurator(dataKey, dataValue, indexPaths) {
	      return {
	        session: dataValue
	      };
	    } //

	  }, {
	    key: "genomeJSONValidator",
	    value: function genomeJSONValidator(json) {
	      var candidateSet = new Set(Object.keys(json));
	      return candidateSet.has('fastaURL');
	    }
	  }, {
	    key: "sessionJSONValidator",
	    value: function sessionJSONValidator(json) {
	      var candidateSet = new Set(Object.keys(json));
	      return candidateSet.has('genome') || candidateSet.has('reference');
	    }
	  }, {
	    key: "trackJSONValidator",
	    value: function trackJSONValidator(json) {
	      var candidateSet = new Set(Object.keys(json));
	      return candidateSet.has('url');
	    } //

	  }, {
	    key: "genomePathValidator",
	    value: function genomePathValidator(extension) {
	      var referenceSet = new Set(['fai', 'fa', 'fasta']);
	      return referenceSet.has(extension);
	    }
	  }, {
	    key: "trackPathValidator",
	    value: function trackPathValidator(extension) {
	      return igv.knownFileExtensions.has(extension) || validIndexExtensionSet.has(extension);
	    }
	  }]);

	  return MultipleFileLoadController;
	}();

	function createDataPathDictionary(paths) {
	  return paths.filter(function (path) {
	    return isKnownFileExtension(getExtension(path));
	  }).reduce(function (accumulator, path) {
	    accumulator[getFilename(path)] = path.google_url || path;
	    return accumulator;
	  }, {});
	}

	function createIndexPathCandidateDictionary(paths) {
	  return paths.filter(function (path) {
	    return isValidIndexExtension(getExtension(path));
	  }).reduce(function (accumulator, path) {
	    accumulator[getFilename(path)] = path.google_url || path;
	    return accumulator;
	  }, {});
	}

	function getIndexURL(indexValue) {
	  if (indexValue) {
	    if (indexValue[0]) {
	      return indexValue[0].path;
	    } else if (indexValue[1]) {
	      return indexValue[1].path;
	    } else {
	      return undefined;
	    }
	  } else {
	    return undefined;
	  }
	}

	function getIndexPaths(dataPathNames, indexPathCandidates) {
	  var list, indexPaths; // add info about presence and requirement (or not) of an index path

	  list = Object.keys(dataPathNames).map(function (dataPathName) {
	    var indexObject; // assess the data files need/requirement for index files

	    indexObject = getIndexObjectWithDataName(dataPathName); // identify the presence/absence of associated index files

	    for (var p in indexObject) {
	      if (indexObject.hasOwnProperty(p)) {
	        indexObject[p].missing = undefined === indexPathCandidates[p];
	      }
	    }

	    return indexObject;
	  }).filter(function (indexObject) {
	    // prune optional AND missing index files
	    if (1 === Object.keys(indexObject).length) {
	      var obj;
	      obj = indexObject[Object.keys(indexObject)[0]];

	      if (true === obj.missing && true === obj.isOptional) {
	        return false;
	      } else if (false === obj.missing && false === obj.isOptional) {
	        return true;
	      } else if (true === obj.missing && false === obj.isOptional) {
	        return true;
	      } else
	        /*( false === obj.missing && true === obj.isOptional)*/
	        {
	          return true;
	        }
	    } else {
	      return true;
	    }
	  });
	  indexPaths = list.reduce(function (accumulator, indexObject) {
	    for (var key in indexObject) {
	      if (indexObject.hasOwnProperty(key)) {
	        var value = void 0;
	        value = indexObject[key];

	        if (undefined === accumulator[value.data]) {
	          accumulator[value.data] = [];
	        }

	        accumulator[value.data].push(false === value.missing ? {
	          name: key,
	          path: indexPathCandidates[key]
	        } : undefined);
	      }
	    }

	    return accumulator;
	  }, {});
	  return indexPaths;
	}

	function dataPathIsMissingIndexPath(dataName, indexPaths) {
	  var status, aa; // if index for data is not in indexPaths it has been culled
	  // because it is optional AND missing

	  if (undefined === indexPaths[dataName]) {
	    status = false;
	  } else if (indexPaths && indexPaths[dataName]) {
	    aa = indexPaths[dataName][0];

	    if (1 === indexPaths[dataName].length) {
	      status = undefined === aa;
	    } else
	      /* BAM Track with two naming conventions */
	      {
	        var bb;
	        bb = indexPaths[dataName][1];

	        if (aa || bb) {
	          status = false;
	        } else {
	          status = true;
	        }
	      }
	  } else {
	    status = true;
	  }

	  return status;
	}

	var nativeGetOwnPropertyNames = objectGetOwnPropertyNames.f;
	var toString$1 = {}.toString;
	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function (it) {
	  try {
	    return nativeGetOwnPropertyNames(it);
	  } catch (error) {
	    return windowNames.slice();
	  }
	}; // fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window


	var f$6 = function getOwnPropertyNames(it) {
	  return windowNames && toString$1.call(it) == '[object Window]' ? getWindowNames(it) : nativeGetOwnPropertyNames(toIndexedObject(it));
	};

	var objectGetOwnPropertyNamesExternal = {
	  f: f$6
	};

	var f$7 = wellKnownSymbol;
	var wellKnownSymbolWrapped = {
	  f: f$7
	};

	var defineProperty$4 = objectDefineProperty.f;

	var defineWellKnownSymbol = function (NAME) {
	  var Symbol = path.Symbol || (path.Symbol = {});
	  if (!has(Symbol, NAME)) defineProperty$4(Symbol, NAME, {
	    value: wellKnownSymbolWrapped.f(NAME)
	  });
	};

	var $forEach$1 = arrayIteration.forEach;
	var HIDDEN = sharedKey('hidden');
	var SYMBOL = 'Symbol';
	var PROTOTYPE$1 = 'prototype';
	var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
	var setInternalState$4 = internalState.set;
	var getInternalState$3 = internalState.getterFor(SYMBOL);
	var ObjectPrototype$1 = Object[PROTOTYPE$1];
	var $Symbol = global_1.Symbol;
	var $stringify = getBuiltIn('JSON', 'stringify');
	var nativeGetOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
	var nativeDefineProperty$1 = objectDefineProperty.f;
	var nativeGetOwnPropertyNames$1 = objectGetOwnPropertyNamesExternal.f;
	var nativePropertyIsEnumerable$1 = objectPropertyIsEnumerable.f;
	var AllSymbols = shared('symbols');
	var ObjectPrototypeSymbols = shared('op-symbols');
	var StringToSymbolRegistry = shared('string-to-symbol-registry');
	var SymbolToStringRegistry = shared('symbol-to-string-registry');
	var WellKnownSymbolsStore$1 = shared('wks');
	var QObject = global_1.QObject; // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173

	var USE_SETTER = !QObject || !QObject[PROTOTYPE$1] || !QObject[PROTOTYPE$1].findChild; // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687

	var setSymbolDescriptor = descriptors && fails(function () {
	  return objectCreate(nativeDefineProperty$1({}, 'a', {
	    get: function () {
	      return nativeDefineProperty$1(this, 'a', {
	        value: 7
	      }).a;
	    }
	  })).a != 7;
	}) ? function (O, P, Attributes) {
	  var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor$1(ObjectPrototype$1, P);
	  if (ObjectPrototypeDescriptor) delete ObjectPrototype$1[P];
	  nativeDefineProperty$1(O, P, Attributes);

	  if (ObjectPrototypeDescriptor && O !== ObjectPrototype$1) {
	    nativeDefineProperty$1(ObjectPrototype$1, P, ObjectPrototypeDescriptor);
	  }
	} : nativeDefineProperty$1;

	var wrap = function (tag, description) {
	  var symbol = AllSymbols[tag] = objectCreate($Symbol[PROTOTYPE$1]);
	  setInternalState$4(symbol, {
	    type: SYMBOL,
	    tag: tag,
	    description: description
	  });
	  if (!descriptors) symbol.description = description;
	  return symbol;
	};

	var isSymbol = useSymbolAsUid ? function (it) {
	  return typeof it == 'symbol';
	} : function (it) {
	  return Object(it) instanceof $Symbol;
	};

	var $defineProperty = function defineProperty(O, P, Attributes) {
	  if (O === ObjectPrototype$1) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
	  anObject(O);
	  var key = toPrimitive(P, true);
	  anObject(Attributes);

	  if (has(AllSymbols, key)) {
	    if (!Attributes.enumerable) {
	      if (!has(O, HIDDEN)) nativeDefineProperty$1(O, HIDDEN, createPropertyDescriptor(1, {}));
	      O[HIDDEN][key] = true;
	    } else {
	      if (has(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
	      Attributes = objectCreate(Attributes, {
	        enumerable: createPropertyDescriptor(0, false)
	      });
	    }

	    return setSymbolDescriptor(O, key, Attributes);
	  }

	  return nativeDefineProperty$1(O, key, Attributes);
	};

	var $defineProperties = function defineProperties(O, Properties) {
	  anObject(O);
	  var properties = toIndexedObject(Properties);
	  var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
	  $forEach$1(keys, function (key) {
	    if (!descriptors || $propertyIsEnumerable.call(properties, key)) $defineProperty(O, key, properties[key]);
	  });
	  return O;
	};

	var $create = function create(O, Properties) {
	  return Properties === undefined ? objectCreate(O) : $defineProperties(objectCreate(O), Properties);
	};

	var $propertyIsEnumerable = function propertyIsEnumerable(V) {
	  var P = toPrimitive(V, true);
	  var enumerable = nativePropertyIsEnumerable$1.call(this, P);
	  if (this === ObjectPrototype$1 && has(AllSymbols, P) && !has(ObjectPrototypeSymbols, P)) return false;
	  return enumerable || !has(this, P) || !has(AllSymbols, P) || has(this, HIDDEN) && this[HIDDEN][P] ? enumerable : true;
	};

	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
	  var it = toIndexedObject(O);
	  var key = toPrimitive(P, true);
	  if (it === ObjectPrototype$1 && has(AllSymbols, key) && !has(ObjectPrototypeSymbols, key)) return;
	  var descriptor = nativeGetOwnPropertyDescriptor$1(it, key);

	  if (descriptor && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) {
	    descriptor.enumerable = true;
	  }

	  return descriptor;
	};

	var $getOwnPropertyNames = function getOwnPropertyNames(O) {
	  var names = nativeGetOwnPropertyNames$1(toIndexedObject(O));
	  var result = [];
	  $forEach$1(names, function (key) {
	    if (!has(AllSymbols, key) && !has(hiddenKeys, key)) result.push(key);
	  });
	  return result;
	};

	var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
	  var IS_OBJECT_PROTOTYPE = O === ObjectPrototype$1;
	  var names = nativeGetOwnPropertyNames$1(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
	  var result = [];
	  $forEach$1(names, function (key) {
	    if (has(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || has(ObjectPrototype$1, key))) {
	      result.push(AllSymbols[key]);
	    }
	  });
	  return result;
	}; // `Symbol` constructor
	// https://tc39.github.io/ecma262/#sec-symbol-constructor


	if (!nativeSymbol) {
	  $Symbol = function Symbol() {
	    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor');
	    var description = !arguments.length || arguments[0] === undefined ? undefined : String(arguments[0]);
	    var tag = uid(description);

	    var setter = function (value) {
	      if (this === ObjectPrototype$1) setter.call(ObjectPrototypeSymbols, value);
	      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
	      setSymbolDescriptor(this, tag, createPropertyDescriptor(1, value));
	    };

	    if (descriptors && USE_SETTER) setSymbolDescriptor(ObjectPrototype$1, tag, {
	      configurable: true,
	      set: setter
	    });
	    return wrap(tag, description);
	  };

	  redefine($Symbol[PROTOTYPE$1], 'toString', function toString() {
	    return getInternalState$3(this).tag;
	  });
	  redefine($Symbol, 'withoutSetter', function (description) {
	    return wrap(uid(description), description);
	  });
	  objectPropertyIsEnumerable.f = $propertyIsEnumerable;
	  objectDefineProperty.f = $defineProperty;
	  objectGetOwnPropertyDescriptor.f = $getOwnPropertyDescriptor;
	  objectGetOwnPropertyNames.f = objectGetOwnPropertyNamesExternal.f = $getOwnPropertyNames;
	  objectGetOwnPropertySymbols.f = $getOwnPropertySymbols;

	  wellKnownSymbolWrapped.f = function (name) {
	    return wrap(wellKnownSymbol(name), name);
	  };

	  if (descriptors) {
	    // https://github.com/tc39/proposal-Symbol-description
	    nativeDefineProperty$1($Symbol[PROTOTYPE$1], 'description', {
	      configurable: true,
	      get: function description() {
	        return getInternalState$3(this).description;
	      }
	    });

	    {
	      redefine(ObjectPrototype$1, 'propertyIsEnumerable', $propertyIsEnumerable, {
	        unsafe: true
	      });
	    }
	  }
	}

	_export({
	  global: true,
	  wrap: true,
	  forced: !nativeSymbol,
	  sham: !nativeSymbol
	}, {
	  Symbol: $Symbol
	});
	$forEach$1(objectKeys(WellKnownSymbolsStore$1), function (name) {
	  defineWellKnownSymbol(name);
	});
	_export({
	  target: SYMBOL,
	  stat: true,
	  forced: !nativeSymbol
	}, {
	  // `Symbol.for` method
	  // https://tc39.github.io/ecma262/#sec-symbol.for
	  'for': function (key) {
	    var string = String(key);
	    if (has(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
	    var symbol = $Symbol(string);
	    StringToSymbolRegistry[string] = symbol;
	    SymbolToStringRegistry[symbol] = string;
	    return symbol;
	  },
	  // `Symbol.keyFor` method
	  // https://tc39.github.io/ecma262/#sec-symbol.keyfor
	  keyFor: function keyFor(sym) {
	    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol');
	    if (has(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
	  },
	  useSetter: function () {
	    USE_SETTER = true;
	  },
	  useSimple: function () {
	    USE_SETTER = false;
	  }
	});
	_export({
	  target: 'Object',
	  stat: true,
	  forced: !nativeSymbol,
	  sham: !descriptors
	}, {
	  // `Object.create` method
	  // https://tc39.github.io/ecma262/#sec-object.create
	  create: $create,
	  // `Object.defineProperty` method
	  // https://tc39.github.io/ecma262/#sec-object.defineproperty
	  defineProperty: $defineProperty,
	  // `Object.defineProperties` method
	  // https://tc39.github.io/ecma262/#sec-object.defineproperties
	  defineProperties: $defineProperties,
	  // `Object.getOwnPropertyDescriptor` method
	  // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptors
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor
	});
	_export({
	  target: 'Object',
	  stat: true,
	  forced: !nativeSymbol
	}, {
	  // `Object.getOwnPropertyNames` method
	  // https://tc39.github.io/ecma262/#sec-object.getownpropertynames
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // `Object.getOwnPropertySymbols` method
	  // https://tc39.github.io/ecma262/#sec-object.getownpropertysymbols
	  getOwnPropertySymbols: $getOwnPropertySymbols
	}); // Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
	// https://bugs.chromium.org/p/v8/issues/detail?id=3443

	_export({
	  target: 'Object',
	  stat: true,
	  forced: fails(function () {
	    objectGetOwnPropertySymbols.f(1);
	  })
	}, {
	  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
	    return objectGetOwnPropertySymbols.f(toObject(it));
	  }
	}); // `JSON.stringify` method behavior with symbols
	// https://tc39.github.io/ecma262/#sec-json.stringify

	if ($stringify) {
	  var FORCED_JSON_STRINGIFY = !nativeSymbol || fails(function () {
	    var symbol = $Symbol(); // MS Edge converts symbol values to JSON as {}

	    return $stringify([symbol]) != '[null]' // WebKit converts symbol values to JSON as null
	    || $stringify({
	      a: symbol
	    }) != '{}' // V8 throws on boxed symbols
	    || $stringify(Object(symbol)) != '{}';
	  });
	  _export({
	    target: 'JSON',
	    stat: true,
	    forced: FORCED_JSON_STRINGIFY
	  }, {
	    // eslint-disable-next-line no-unused-vars
	    stringify: function stringify(it, replacer, space) {
	      var args = [it];
	      var index = 1;
	      var $replacer;

	      while (arguments.length > index) args.push(arguments[index++]);

	      $replacer = replacer;
	      if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined

	      if (!isArray(replacer)) replacer = function (key, value) {
	        if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
	        if (!isSymbol(value)) return value;
	      };
	      args[1] = replacer;
	      return $stringify.apply(null, args);
	    }
	  });
	} // `Symbol.prototype[@@toPrimitive]` method
	// https://tc39.github.io/ecma262/#sec-symbol.prototype-@@toprimitive


	if (!$Symbol[PROTOTYPE$1][TO_PRIMITIVE]) {
	  createNonEnumerableProperty($Symbol[PROTOTYPE$1], TO_PRIMITIVE, $Symbol[PROTOTYPE$1].valueOf);
	} // `Symbol.prototype[@@toStringTag]` property
	// https://tc39.github.io/ecma262/#sec-symbol.prototype-@@tostringtag


	setToStringTag($Symbol, SYMBOL);
	hiddenKeys[HIDDEN] = true;

	var defineProperty$5 = objectDefineProperty.f;
	var NativeSymbol = global_1.Symbol;

	if (descriptors && typeof NativeSymbol == 'function' && (!('description' in NativeSymbol.prototype) || // Safari 12 bug
	NativeSymbol().description !== undefined)) {
	  var EmptyStringDescriptionStore = {}; // wrap Symbol constructor for correct work with undefined description

	  var SymbolWrapper = function Symbol() {
	    var description = arguments.length < 1 || arguments[0] === undefined ? undefined : String(arguments[0]);
	    var result = this instanceof SymbolWrapper ? new NativeSymbol(description) // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
	    : description === undefined ? NativeSymbol() : NativeSymbol(description);
	    if (description === '') EmptyStringDescriptionStore[result] = true;
	    return result;
	  };

	  copyConstructorProperties(SymbolWrapper, NativeSymbol);
	  var symbolPrototype = SymbolWrapper.prototype = NativeSymbol.prototype;
	  symbolPrototype.constructor = SymbolWrapper;
	  var symbolToString = symbolPrototype.toString;
	  var native = String(NativeSymbol('test')) == 'Symbol(test)';
	  var regexp = /^Symbol\((.*)\)[^)]+$/;
	  defineProperty$5(symbolPrototype, 'description', {
	    configurable: true,
	    get: function description() {
	      var symbol = isObject(this) ? this.valueOf() : this;
	      var string = symbolToString.call(symbol);
	      if (has(EmptyStringDescriptionStore, symbol)) return '';
	      var desc = native ? string.slice(7, -1) : string.replace(regexp, '$1');
	      return desc === '' ? undefined : desc;
	    }
	  });
	  _export({
	    global: true,
	    forced: true
	  }, {
	    Symbol: SymbolWrapper
	  });
	}

	/*
	 * The MIT License (MIT)
	 *
	 * Copyright (c) 2016-2017 The Regents of the University of California
	 * Author: Jim Robinson
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
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 */
	const getDataWrapper = function (data) {
	  if (typeof data == 'string' || data instanceof String) {
	    return new StringDataWrapper(data);
	  } else {
	    return new ByteArrayDataWrapper(data);
	  }
	}; // Data might be a string, or an UInt8Array


	var StringDataWrapper = function (string) {
	  this.data = string;
	  this.ptr = 0;
	};

	StringDataWrapper.prototype.nextLine = function () {
	  //return this.split(/\r\n|\n|\r/gm);
	  var start = this.ptr,
	      idx = this.data.indexOf('\n', start);

	  if (idx > 0) {
	    this.ptr = idx + 1; // Advance pointer for next line

	    return idx === start ? undefined : this.data.substring(start, idx).trim();
	  } else {
	    // Last line
	    this.ptr = this.data.length;
	    return start >= this.data.length ? undefined : this.data.substring(start).trim();
	  }
	}; // For use in applications where whitespace carries meaning
	// Returns "" for an empty row (not undefined like nextLine), since this is needed in AED


	StringDataWrapper.prototype.nextLineNoTrim = function () {
	  var start = this.ptr,
	      idx = this.data.indexOf('\n', start),
	      data = this.data;

	  if (idx > 0) {
	    this.ptr = idx + 1; // Advance pointer for next line

	    if (idx > start && data.charAt(idx - 1) === '\r') {
	      // Trim CR manually in CR/LF sequence
	      return data.substring(start, idx - 1);
	    }

	    return data.substring(start, idx);
	  } else {
	    var length = data.length;
	    this.ptr = length; // Return undefined only at the very end of the data

	    return start >= length ? undefined : data.substring(start);
	  }
	};

	var ByteArrayDataWrapper = function (array) {
	  this.data = array;
	  this.length = this.data.length;
	  this.ptr = 0;
	};

	ByteArrayDataWrapper.prototype.nextLine = function () {
	  var c, result;
	  result = "";
	  if (this.ptr >= this.length) return undefined;

	  for (var i = this.ptr; i < this.length; i++) {
	    c = String.fromCharCode(this.data[i]);
	    if (c === '\r') continue;
	    if (c === '\n') break;
	    result = result + c;
	  }

	  this.ptr = i + 1;
	  return result;
	}; // The ByteArrayDataWrapper does not do any trimming by default, can reuse the function


	ByteArrayDataWrapper.prototype.nextLineNoTrim = ByteArrayDataWrapper.prototype.nextLine;

	/*
	 * The MIT License (MIT)
	 *
	 * Copyright (c) 2019 The Regents of the University of California
	 * Author: Jim Robinson
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
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 */
	const columns = ['Biosample', 'Target', 'Assay Type', 'Output Type', 'Bio Rep', 'Tech Rep', 'Format', 'Experiment', 'Accession', 'Lab'];

	class EncodeDataSource {
	  constructor(genomeId, filter, suffix) {
	    this.genomeId = genomeId;
	    this.filter = filter;
	    this.suffix = suffix || ".txt";
	  }

	  async tableData() {
	    return this.fetchData();
	  }

	  async tableColumns() {
	    return columns;
	  }

	  async fetchData() {
	    const id = canonicalId(this.genomeId);
	    const url = "https://s3.amazonaws.com/igv.org.app/encode/" + id + this.suffix;
	    const response = await fetch(url);
	    const data = await response.text();
	    const records = parseTabData(data, this.filter);
	    records.sort(encodeSort);
	    return records;
	  }

	  static supportsGenome(genomeId) {
	    const knownGenomes = new Set(["ce10", "ce11", "dm3", "dm6", "GRCh38", "hg19", "mm9", "mm10"]);
	    const id = canonicalId(genomeId);
	    return knownGenomes.has(id);
	  }

	}

	function parseTabData(data, filter) {
	  var dataWrapper, line;
	  dataWrapper = getDataWrapper(data);
	  let records = [];
	  dataWrapper.nextLine(); // Skip header

	  while (line = dataWrapper.nextLine()) {
	    let tokens = line.split("\t");
	    let record = {
	      "Assembly": tokens[1],
	      "ExperimentID": tokens[0],
	      "Experiment": tokens[0].substr(13).replace("/", ""),
	      "Biosample": tokens[2],
	      "Assay Type": tokens[3],
	      "Target": tokens[4],
	      "Format": tokens[8],
	      "Output Type": tokens[7],
	      "Lab": tokens[9],
	      "url": "https://www.encodeproject.org" + tokens[10],
	      "Bio Rep": tokens[5],
	      "Tech Rep": tokens[6],
	      "Accession": tokens[11]
	    };
	    record["name"] = constructName(record);

	    if (filter === undefined || filter(record)) {
	      records.push(record);
	    }
	  }

	  return records;
	}

	function constructName(record) {
	  let name = record["Cell Type"] || "";

	  if (record["Target"]) {
	    name += " " + record["Target"];
	  }

	  if (record["Assay Type"].toLowerCase() !== "chip-seq") {
	    name += " " + record["Assay Type"];
	  }

	  if (record["Bio Rep"]) {
	    name += " " + record["Bio Rep"];
	  }

	  if (record["Tech Rep"]) {
	    name += (record["Bio Rep"] ? ":" : " 0:") + record["Tech Rep"];
	  }

	  name += " " + record["Output Type"];
	  name += " " + record["Accession"];
	  return name;
	}

	function encodeSort(a, b) {
	  var aa1, aa2, cc1, cc2, tt1, tt2;
	  aa1 = a['Assay Type'];
	  aa2 = b['Assay Type'];
	  cc1 = a['Biosample'];
	  cc2 = b['Biosample'];
	  tt1 = a['Target'];
	  tt2 = b['Target'];

	  if (aa1 === aa2) {
	    if (cc1 === cc2) {
	      if (tt1 === tt2) {
	        return 0;
	      } else if (tt1 < tt2) {
	        return -1;
	      } else {
	        return 1;
	      }
	    } else if (cc1 < cc2) {
	      return -1;
	    } else {
	      return 1;
	    }
	  } else {
	    if (aa1 < aa2) {
	      return -1;
	    } else {
	      return 1;
	    }
	  }
	}

	function canonicalId(genomeId) {
	  switch (genomeId) {
	    case "hg38":
	      return "GRCh38";

	    case "CRCh37":
	      return "hg19";

	    case "GRCm38":
	      return "mm10";

	    case "NCBI37":
	      return "mm9";

	    case "WBcel235":
	      return "ce11";

	    case "WS220":
	      return "ce10";

	    default:
	      return genomeId;
	  }
	}

	class ModalTable {
	  constructor(args) {
	    this.datasource = args.datasource;
	    this.selectHandler = args.selectHandler;
	    this.pageLength = args.pageLength || 10;

	    if (args.selectionStyle) {
	      this.select = {
	        style: args.selectionStyle
	      };
	    } else {
	      this.select = true;
	    }

	    const id = args.id;
	    const title = args.title || '';
	    const parent = args.parent ? $(args.parent) : $('body');
	    const html = `
        <div id="${id}" class="modal fade">
        
            <div class="modal-dialog modal-xl">
        
                <div class="modal-content">
        
                    <div class="modal-header">
                        <div class="modal-title">${title}</div>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
        
                    <div class="modal-body">
        
                        <div id="${id}-spinner" class="spinner-border" style="display: none;">
                            <!-- spinner -->
                        </div>
        
                        <div id="${id}-datatable-container">
        
                        </div>
                    </div>
        
                    <div class="modal-footer">
                        <button type="button" class="btn btn-sm btn-outline-secondary" data-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-sm btn-secondary" data-dismiss="modal">OK</button>
                    </div>
        
                </div>
        
            </div>
        
        </div>
    `;
	    const $m = $(html);
	    parent.append($m);
	    this.$modal = $m;
	    this.$datatableContainer = $m.find(`#${id}-datatable-container`);
	    this.$spinner = $m.find(`#${id}-spinner`);
	    const $okButton = $m.find('.modal-footer button:nth-child(2)');
	    $m.on('shown.bs.modal', e => {
	      this.buildTable();
	    });
	    $m.on('hidden.bs.modal', e => {
	      $(e.relatedTarget).find('tr.selected').removeClass('selected');
	    });
	    $okButton.on('click', e => {
	      const selected = this.getSelectedTableRowsData.call(this, this.$dataTable.$('tr.selected'));

	      if (selected && this.selectHandler) {
	        this.selectHandler(selected);
	      }
	    });
	  }

	  remove() {
	    this.$modal.remove();
	  }

	  setDatasource(datasource) {
	    this.datasource = datasource;
	    this.$datatableContainer.empty();
	    this.$table = undefined;
	  }

	  async buildTable() {
	    if (!this.$table && this.datasource) {
	      this.$table = $('<table cellpadding="0" cellspacing="0" border="0" class="display"></table>');
	      this.$datatableContainer.append(this.$table);

	      try {
	        this.startSpinner();
	        const datasource = this.datasource;
	        const tableData = await datasource.tableData();
	        const tableColumns = await datasource.tableColumns();
	        const columnFormat = tableColumns.map(c => ({
	          title: c,
	          data: c
	        }));
	        const config = {
	          data: tableData,
	          columns: columnFormat,
	          pageLength: this.pageLength,
	          select: this.select,
	          autoWidth: false,
	          paging: true,
	          scrollX: true,
	          scrollY: '400px',
	          scroller: true,
	          scrollCollapse: true
	        };

	        if (Reflect.has(datasource, 'columnDefs')) {
	          config.columnDefs = datasource.columnDefs;
	        }

	        this.tableData = tableData;
	        this.$dataTable = this.$table.dataTable(config);
	        this.$table.api().columns.adjust().draw(); // Don't try to simplify this, you'll break it
	      } catch (e) {} finally {
	        this.stopSpinner();
	      }
	    }
	  }

	  getSelectedTableRowsData($rows) {
	    const tableData = this.tableData;
	    const result = [];

	    if ($rows.length > 0) {
	      $rows.removeClass('selected');
	      const api = this.$table.api();
	      $rows.each(function () {
	        const index = api.row(this).index();
	        result.push(tableData[index]);
	      });
	    }

	    return result;
	  }

	  startSpinner() {
	    if (this.$spinner) this.$spinner.show();
	  }

	  stopSpinner() {
	    if (this.$spinner) this.$spinner.hide();
	  }

	}

	var TrackLoadController = /*#__PURE__*/function () {
	  function TrackLoadController(_ref) {
	    var browser = _ref.browser,
	        trackRegistryFile = _ref.trackRegistryFile,
	        $urlModal = _ref.$urlModal,
	        encodeModalTable = _ref.encodeModalTable,
	        $dropdownMenu = _ref.$dropdownMenu,
	        $genericTrackSelectModal = _ref.$genericTrackSelectModal,
	        uberFileLoader = _ref.uberFileLoader;

	    _classCallCheck(this, TrackLoadController);

	    var urlConfig;
	    this.browser = browser;
	    this.trackRegistryFile = trackRegistryFile;
	    this.trackRegistry = undefined;
	    this.encodeModalTable = encodeModalTable;
	    this.$dropdownMenu = $dropdownMenu;
	    this.$modal = $genericTrackSelectModal; // URL

	    urlConfig = {
	      $widgetParent: $urlModal.find('.modal-body'),
	      mode: 'url'
	    };
	    this.urlWidget = new FileLoadWidget(urlConfig, new FileLoadManager());
	    configureModal(this.urlWidget, $urlModal, function (fileLoadManager) {
	      uberFileLoader.ingestPaths(fileLoadManager.getPaths());
	      return true;
	    });
	    this.updateTrackMenus(browser.genome.id);
	  }

	  _createClass(TrackLoadController, [{
	    key: "getTrackRegistry",
	    value: function () {
	      var _getTrackRegistry = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
	        var response;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                if (!this.trackRegistry) {
	                  _context.next = 4;
	                  break;
	                }

	                return _context.abrupt("return", this.trackRegistry);

	              case 4:
	                if (!this.trackRegistryFile) {
	                  _context.next = 24;
	                  break;
	                }

	                response = undefined;
	                _context.prev = 6;
	                _context.next = 9;
	                return fetch(this.trackRegistryFile);

	              case 9:
	                response = _context.sent;
	                _context.next = 15;
	                break;

	              case 12:
	                _context.prev = 12;
	                _context.t0 = _context["catch"](6);
	                console.error(_context.t0);

	              case 15:
	                if (!response) {
	                  _context.next = 21;
	                  break;
	                }

	                _context.next = 18;
	                return response.json();

	              case 18:
	                return _context.abrupt("return", _context.sent);

	              case 21:
	                return _context.abrupt("return", undefined);

	              case 22:
	                _context.next = 25;
	                break;

	              case 24:
	                return _context.abrupt("return", undefined);

	              case 25:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[6, 12]]);
	      }));

	      function getTrackRegistry() {
	        return _getTrackRegistry.apply(this, arguments);
	      }

	      return getTrackRegistry;
	    }()
	  }, {
	    key: "createEncodeTable",
	    value: function createEncodeTable(genomeID) {
	      var datasource = new EncodeDataSource(genomeID);
	      this.encodeModalTable.setDatasource(datasource);
	    }
	  }, {
	    key: "updateTrackMenus",
	    value: function updateTrackMenus(genomeID) {
	      var _this = this;

	      (function () {
	        var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(genomeID) {
	          var id_prefix, $divider, searchString, $found, e, paths, responses, jsons, buttonConfigurations, _iterator, _step, json, info, _iterator2, _step2, _loop;

	          return regeneratorRuntime.wrap(function _callee2$(_context2) {
	            while (1) {
	              switch (_context2.prev = _context2.next) {
	                case 0:
	                  id_prefix = 'genome_specific_';
	                  $divider = _this.$dropdownMenu.find('#igv-app-annotations-section');
	                  searchString = '[id^=' + id_prefix + ']';
	                  $found = _this.$dropdownMenu.find(searchString);
	                  $found.remove();
	                  _this.trackRegistry = undefined;
	                  _context2.prev = 6;
	                  _context2.next = 9;
	                  return _this.getTrackRegistry();

	                case 9:
	                  _this.trackRegistry = _context2.sent;
	                  _context2.next = 15;
	                  break;

	                case 12:
	                  _context2.prev = 12;
	                  _context2.t0 = _context2["catch"](6);
	                  alertPanel.presentAlert(_context2.t0.message);

	                case 15:
	                  if (!(undefined === _this.trackRegistry)) {
	                    _context2.next = 19;
	                    break;
	                  }

	                  e = new Error("Error retrieving registry via getTrackRegistry function");
	                  alertPanel.presentAlert(e.message);
	                  throw e;

	                case 19:
	                  paths = _this.trackRegistry[genomeID];

	                  if (!(undefined === paths)) {
	                    _context2.next = 23;
	                    break;
	                  }

	                  console.warn("There are no tracks in the track registryy for genome ".concat(genomeID));
	                  return _context2.abrupt("return");

	                case 23:
	                  responses = [];
	                  _context2.prev = 24;
	                  _context2.next = 27;
	                  return Promise.all(paths.map(function (path) {
	                    return fetch(path);
	                  }));

	                case 27:
	                  responses = _context2.sent;
	                  _context2.next = 33;
	                  break;

	                case 30:
	                  _context2.prev = 30;
	                  _context2.t1 = _context2["catch"](24);
	                  alertPanel.presentAlert(_context2.t1.message);

	                case 33:
	                  jsons = [];
	                  _context2.prev = 34;
	                  _context2.next = 37;
	                  return Promise.all(responses.map(function (response) {
	                    return response.json();
	                  }));

	                case 37:
	                  jsons = _context2.sent;
	                  _context2.next = 43;
	                  break;

	                case 40:
	                  _context2.prev = 40;
	                  _context2.t2 = _context2["catch"](34);
	                  alertPanel.presentAlert(_context2.t2.message);

	                case 43:
	                  buttonConfigurations = [];
	                  _iterator = _createForOfIteratorHelper(jsons);
	                  _context2.prev = 45;

	                  _iterator.s();

	                case 47:
	                  if ((_step = _iterator.n()).done) {
	                    _context2.next = 71;
	                    break;
	                  }

	                  json = _step.value;

	                  if (!('ENCODE' === json.type)) {
	                    _context2.next = 54;
	                    break;
	                  }

	                  _this.createEncodeTable(json.genomeID);

	                  buttonConfigurations.push(json);
	                  _context2.next = 69;
	                  break;

	                case 54:
	                  if (!('GTEX' === json.type)) {
	                    _context2.next = 68;
	                    break;
	                  }

	                  info = undefined;
	                  _context2.prev = 56;
	                  _context2.next = 59;
	                  return igv.GtexUtils.getTissueInfo(json.datasetId);

	                case 59:
	                  info = _context2.sent;
	                  _context2.next = 65;
	                  break;

	                case 62:
	                  _context2.prev = 62;
	                  _context2.t3 = _context2["catch"](56);
	                  alertPanel.presentAlert(_context2.t3.message);

	                case 65:
	                  if (info) {
	                    json.tracks = info.tissueInfo.map(function (tissue) {
	                      return igv.GtexUtils.trackConfiguration(tissue);
	                    });
	                    buttonConfigurations.push(json);
	                  }

	                  _context2.next = 69;
	                  break;

	                case 68:
	                  buttonConfigurations.push(json);

	                case 69:
	                  _context2.next = 47;
	                  break;

	                case 71:
	                  _context2.next = 76;
	                  break;

	                case 73:
	                  _context2.prev = 73;
	                  _context2.t4 = _context2["catch"](45);

	                  _iterator.e(_context2.t4);

	                case 76:
	                  _context2.prev = 76;

	                  _iterator.f();

	                  return _context2.finish(76);

	                case 79:
	                  buttonConfigurations = buttonConfigurations.reverse();
	                  _iterator2 = _createForOfIteratorHelper(buttonConfigurations);

	                  try {
	                    _loop = function _loop() {
	                      var config = _step2.value;
	                      var $button = $('<button>', {
	                        class: 'dropdown-item',
	                        type: 'button'
	                      });
	                      var str = config.label + ' ...';
	                      $button.text(str);
	                      var id = id_prefix + config.label.toLowerCase().split(' ').join('_');
	                      $button.attr('id', id);
	                      $button.insertAfter($divider);
	                      $button.on('click', function () {
	                        if ('ENCODE' === config.type) {
	                          _this.encodeModalTable.$modal.modal('show');
	                        } else {
	                          var markup = '<div>' + config.label + '</div>';

	                          if (config.description) {
	                            markup += '<div>' + config.description + '</div>';
	                          }

	                          _this.$modal.find('#igv-app-generic-track-select-modal-label').html(markup);

	                          configureModalSelectList(_this.browser, _this.$modal, config.tracks);

	                          _this.$modal.modal('show');
	                        }
	                      });
	                    };

	                    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	                      _loop();
	                    }
	                  } catch (err) {
	                    _iterator2.e(err);
	                  } finally {
	                    _iterator2.f();
	                  }

	                case 82:
	                case "end":
	                  return _context2.stop();
	              }
	            }
	          }, _callee2, null, [[6, 12], [24, 30], [34, 40], [45, 73, 76, 79], [56, 62]]);
	        }));

	        return function (_x) {
	          return _ref2.apply(this, arguments);
	        };
	      })()(genomeID);
	    }
	  }]);

	  return TrackLoadController;
	}();

	function configureModalSelectList(browser, $modal, configurations) {
	  var $select, $option;
	  $modal.find('select').remove();
	  $select = $('<select>', {
	    class: 'form-control'
	  });
	  $modal.find('.form-group').append($select);
	  $option = $('<option>', {
	    text: 'Select...'
	  });
	  $select.append($option);
	  $option.attr('selected', 'selected');
	  $option.val(undefined);
	  configurations.reduce(function ($accumulator, configuration) {
	    $option = $('<option>', {
	      value: configuration.name,
	      text: configuration.name
	    });
	    $select.append($option);
	    $option.data('track', configuration);
	    $accumulator.append($option);
	    return $accumulator;
	  }, $select);
	  $select.on('change', function () {
	    var $option = $select.find('option:selected');
	    var value = $option.val();

	    if ('' === value) ; else {
	      $option.removeAttr("selected");
	      var configuration = $option.data('track');
	      browser.loadTrack(configuration);
	    }

	    $modal.modal('hide');
	  });
	}

	var trackLoadControllerConfigurator = function trackLoadControllerConfigurator(_ref3) {
	  var browser = _ref3.browser,
	      trackRegistryFile = _ref3.trackRegistryFile,
	      $googleDriveButton = _ref3.$googleDriveButton;
	  var multipleFileTrackConfig = {
	    $modal: $('#igv-app-multiple-file-load-modal'),
	    modalTitle: 'Track File Error',
	    $localFileInput: $('#igv-app-dropdown-local-track-file-input'),
	    $dropboxButton: $('#igv-app-dropdown-dropbox-track-file-button'),
	    $googleDriveButton: $googleDriveButton,
	    configurationHandler: MultipleFileLoadController.trackConfigurator,
	    jsonFileValidator: MultipleFileLoadController.trackJSONValidator,
	    pathValidator: MultipleFileLoadController.trackPathValidator,
	    fileLoadHandler: function fileLoadHandler(configurations) {
	      browser.loadTrackList(configurations);
	    }
	  };
	  var encodeModalTableConfig = {
	    id: "igv-app-encode-modal",
	    title: "ENCODE",
	    selectionStyle: 'multi',
	    pageLength: 100,
	    selectHandler: function selectHandler(trackConfigurations) {
	      (function () {
	        var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(config) {
	          return regeneratorRuntime.wrap(function _callee3$(_context3) {
	            while (1) {
	              switch (_context3.prev = _context3.next) {
	                case 0:
	                  _context3.next = 2;
	                  return browser.loadTrackList(config);

	                case 2:
	                case "end":
	                  return _context3.stop();
	              }
	            }
	          }, _callee3);
	        }));

	        return function (_x2) {
	          return _ref4.apply(this, arguments);
	        };
	      })()(trackConfigurations);
	    }
	  };
	  return {
	    browser: browser,
	    trackRegistryFile: trackRegistryFile,
	    $urlModal: $('#igv-app-track-from-url-modal'),
	    encodeModalTable: new ModalTable(encodeModalTableConfig),
	    $dropdownMenu: $('#igv-app-track-dropdown-menu'),
	    $genericTrackSelectModal: $('#igv-app-generic-track-select-modal'),
	    uberFileLoader: new MultipleFileLoadController(browser, multipleFileTrackConfig)
	  };
	};

	var min$5 = Math.min;
	var nativeLastIndexOf = [].lastIndexOf;
	var NEGATIVE_ZERO$1 = !!nativeLastIndexOf && 1 / [1].lastIndexOf(1, -0) < 0;
	var STRICT_METHOD$4 = arrayMethodIsStrict('lastIndexOf'); // For preventing possible almost infinite loop in non-standard implementations, test the forward version of the method

	var USES_TO_LENGTH$8 = arrayMethodUsesToLength('indexOf', {
	  ACCESSORS: true,
	  1: 0
	});
	var FORCED$2 = NEGATIVE_ZERO$1 || !STRICT_METHOD$4 || !USES_TO_LENGTH$8; // `Array.prototype.lastIndexOf` method implementation
	// https://tc39.github.io/ecma262/#sec-array.prototype.lastindexof

	var arrayLastIndexOf = FORCED$2 ? function lastIndexOf(searchElement
	/* , fromIndex = @[*-1] */
	) {
	  // convert -0 to +0
	  if (NEGATIVE_ZERO$1) return nativeLastIndexOf.apply(this, arguments) || 0;
	  var O = toIndexedObject(this);
	  var length = toLength(O.length);
	  var index = length - 1;
	  if (arguments.length > 1) index = min$5(index, toInteger(arguments[1]));
	  if (index < 0) index = length + index;

	  for (; index >= 0; index--) if (index in O && O[index] === searchElement) return index || 0;

	  return -1;
	} : nativeLastIndexOf;

	// https://tc39.github.io/ecma262/#sec-array.prototype.lastindexof

	_export({
	  target: 'Array',
	  proto: true,
	  forced: arrayLastIndexOf !== [].lastIndexOf
	}, {
	  lastIndexOf: arrayLastIndexOf
	});

	var TO_STRING = 'toString';
	var RegExpPrototype = RegExp.prototype;
	var nativeToString = RegExpPrototype[TO_STRING];
	var NOT_GENERIC = fails(function () {
	  return nativeToString.call({
	    source: 'a',
	    flags: 'b'
	  }) != '/a/b';
	}); // FF44- RegExp#toString has a wrong name

	var INCORRECT_NAME = nativeToString.name != TO_STRING; // `RegExp.prototype.toString` method
	// https://tc39.github.io/ecma262/#sec-regexp.prototype.tostring

	if (NOT_GENERIC || INCORRECT_NAME) {
	  redefine(RegExp.prototype, TO_STRING, function toString() {
	    var R = anObject(this);
	    var p = String(R.source);
	    var rf = R.flags;
	    var f = String(rf === undefined && R instanceof RegExp && !('flags' in RegExpPrototype) ? regexpFlags.call(R) : rf);
	    return '/' + p + '/' + f;
	  }, {
	    unsafe: true
	  });
	}

	/**
	 * @fileoverview
	 * - Using the 'QRCode for Javascript library'
	 * - Fixed dataset of 'QRCode for Javascript library' for support full-spec.
	 * - this library has no dependencies.
	 *
	 * @author davidshimjs
	 * @see <a href="http://www.d-project.com/" target="_blank">http://www.d-project.com/</a>
	 * @see <a href="http://jeromeetienne.github.com/jquery-qrcode/" target="_blank">http://jeromeetienne.github.com/jquery-qrcode/</a>
	 */
	//---------------------------------------------------------------------
	// QRCode for JavaScript
	//
	// Copyright (c) 2009 Kazuhiko Arase
	//
	// URL: http://www.d-project.com/
	//
	// Licensed under the MIT license:
	//   http://www.opensource.org/licenses/mit-license.php
	//
	// The word "QR Code" is registered trademark of
	// DENSO WAVE INCORPORATED
	//   http://www.denso-wave.com/qrcode/faqpatent-e.html
	//
	//---------------------------------------------------------------------
	function QR8bitByte(data) {
	  this.mode = QRMode.MODE_8BIT_BYTE;
	  this.data = data;
	  this.parsedData = []; // Added to support UTF-8 Characters

	  for (var i = 0, l = this.data.length; i < l; i++) {
	    var byteArray = [];
	    var code = this.data.charCodeAt(i);

	    if (code > 0x10000) {
	      byteArray[0] = 0xF0 | (code & 0x1C0000) >>> 18;
	      byteArray[1] = 0x80 | (code & 0x3F000) >>> 12;
	      byteArray[2] = 0x80 | (code & 0xFC0) >>> 6;
	      byteArray[3] = 0x80 | code & 0x3F;
	    } else if (code > 0x800) {
	      byteArray[0] = 0xE0 | (code & 0xF000) >>> 12;
	      byteArray[1] = 0x80 | (code & 0xFC0) >>> 6;
	      byteArray[2] = 0x80 | code & 0x3F;
	    } else if (code > 0x80) {
	      byteArray[0] = 0xC0 | (code & 0x7C0) >>> 6;
	      byteArray[1] = 0x80 | code & 0x3F;
	    } else {
	      byteArray[0] = code;
	    }

	    this.parsedData.push(byteArray);
	  }

	  this.parsedData = Array.prototype.concat.apply([], this.parsedData);

	  if (this.parsedData.length != this.data.length) {
	    this.parsedData.unshift(191);
	    this.parsedData.unshift(187);
	    this.parsedData.unshift(239);
	  }
	}

	QR8bitByte.prototype = {
	  getLength: function getLength(buffer) {
	    return this.parsedData.length;
	  },
	  write: function write(buffer) {
	    for (var i = 0, l = this.parsedData.length; i < l; i++) {
	      buffer.put(this.parsedData[i], 8);
	    }
	  }
	};

	function QRCodeModel(typeNumber, errorCorrectLevel) {
	  this.typeNumber = typeNumber;
	  this.errorCorrectLevel = errorCorrectLevel;
	  this.modules = null;
	  this.moduleCount = 0;
	  this.dataCache = null;
	  this.dataList = [];
	}

	QRCodeModel.prototype = {
	  addData: function addData(data) {
	    var newData = new QR8bitByte(data);
	    this.dataList.push(newData);
	    this.dataCache = null;
	  },
	  isDark: function isDark(row, col) {
	    if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
	      throw new Error(row + "," + col);
	    }

	    return this.modules[row][col];
	  },
	  getModuleCount: function getModuleCount() {
	    return this.moduleCount;
	  },
	  make: function make() {
	    this.makeImpl(false, this.getBestMaskPattern());
	  },
	  makeImpl: function makeImpl(test, maskPattern) {
	    this.moduleCount = this.typeNumber * 4 + 17;
	    this.modules = new Array(this.moduleCount);

	    for (var row = 0; row < this.moduleCount; row++) {
	      this.modules[row] = new Array(this.moduleCount);

	      for (var col = 0; col < this.moduleCount; col++) {
	        this.modules[row][col] = null;
	      }
	    }

	    this.setupPositionProbePattern(0, 0);
	    this.setupPositionProbePattern(this.moduleCount - 7, 0);
	    this.setupPositionProbePattern(0, this.moduleCount - 7);
	    this.setupPositionAdjustPattern();
	    this.setupTimingPattern();
	    this.setupTypeInfo(test, maskPattern);

	    if (this.typeNumber >= 7) {
	      this.setupTypeNumber(test);
	    }

	    if (this.dataCache == null) {
	      this.dataCache = QRCodeModel.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
	    }

	    this.mapData(this.dataCache, maskPattern);
	  },
	  setupPositionProbePattern: function setupPositionProbePattern(row, col) {
	    for (var r = -1; r <= 7; r++) {
	      if (row + r <= -1 || this.moduleCount <= row + r) continue;

	      for (var c = -1; c <= 7; c++) {
	        if (col + c <= -1 || this.moduleCount <= col + c) continue;

	        if (0 <= r && r <= 6 && (c == 0 || c == 6) || 0 <= c && c <= 6 && (r == 0 || r == 6) || 2 <= r && r <= 4 && 2 <= c && c <= 4) {
	          this.modules[row + r][col + c] = true;
	        } else {
	          this.modules[row + r][col + c] = false;
	        }
	      }
	    }
	  },
	  getBestMaskPattern: function getBestMaskPattern() {
	    var minLostPoint = 0;
	    var pattern = 0;

	    for (var i = 0; i < 8; i++) {
	      this.makeImpl(true, i);
	      var lostPoint = QRUtil.getLostPoint(this);

	      if (i == 0 || minLostPoint > lostPoint) {
	        minLostPoint = lostPoint;
	        pattern = i;
	      }
	    }

	    return pattern;
	  },
	  createMovieClip: function createMovieClip(target_mc, instance_name, depth) {
	    var qr_mc = target_mc.createEmptyMovieClip(instance_name, depth);
	    var cs = 1;
	    this.make();

	    for (var row = 0; row < this.modules.length; row++) {
	      var y = row * cs;

	      for (var col = 0; col < this.modules[row].length; col++) {
	        var x = col * cs;
	        var dark = this.modules[row][col];

	        if (dark) {
	          qr_mc.beginFill(0, 100);
	          qr_mc.moveTo(x, y);
	          qr_mc.lineTo(x + cs, y);
	          qr_mc.lineTo(x + cs, y + cs);
	          qr_mc.lineTo(x, y + cs);
	          qr_mc.endFill();
	        }
	      }
	    }

	    return qr_mc;
	  },
	  setupTimingPattern: function setupTimingPattern() {
	    for (var r = 8; r < this.moduleCount - 8; r++) {
	      if (this.modules[r][6] != null) {
	        continue;
	      }

	      this.modules[r][6] = r % 2 == 0;
	    }

	    for (var c = 8; c < this.moduleCount - 8; c++) {
	      if (this.modules[6][c] != null) {
	        continue;
	      }

	      this.modules[6][c] = c % 2 == 0;
	    }
	  },
	  setupPositionAdjustPattern: function setupPositionAdjustPattern() {
	    var pos = QRUtil.getPatternPosition(this.typeNumber);

	    for (var i = 0; i < pos.length; i++) {
	      for (var j = 0; j < pos.length; j++) {
	        var row = pos[i];
	        var col = pos[j];

	        if (this.modules[row][col] != null) {
	          continue;
	        }

	        for (var r = -2; r <= 2; r++) {
	          for (var c = -2; c <= 2; c++) {
	            if (r == -2 || r == 2 || c == -2 || c == 2 || r == 0 && c == 0) {
	              this.modules[row + r][col + c] = true;
	            } else {
	              this.modules[row + r][col + c] = false;
	            }
	          }
	        }
	      }
	    }
	  },
	  setupTypeNumber: function setupTypeNumber(test) {
	    var bits = QRUtil.getBCHTypeNumber(this.typeNumber);

	    for (var i = 0; i < 18; i++) {
	      var mod = !test && (bits >> i & 1) == 1;
	      this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
	    }

	    for (var i = 0; i < 18; i++) {
	      var mod = !test && (bits >> i & 1) == 1;
	      this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
	    }
	  },
	  setupTypeInfo: function setupTypeInfo(test, maskPattern) {
	    var data = this.errorCorrectLevel << 3 | maskPattern;
	    var bits = QRUtil.getBCHTypeInfo(data);

	    for (var i = 0; i < 15; i++) {
	      var mod = !test && (bits >> i & 1) == 1;

	      if (i < 6) {
	        this.modules[i][8] = mod;
	      } else if (i < 8) {
	        this.modules[i + 1][8] = mod;
	      } else {
	        this.modules[this.moduleCount - 15 + i][8] = mod;
	      }
	    }

	    for (var i = 0; i < 15; i++) {
	      var mod = !test && (bits >> i & 1) == 1;

	      if (i < 8) {
	        this.modules[8][this.moduleCount - i - 1] = mod;
	      } else if (i < 9) {
	        this.modules[8][15 - i - 1 + 1] = mod;
	      } else {
	        this.modules[8][15 - i - 1] = mod;
	      }
	    }

	    this.modules[this.moduleCount - 8][8] = !test;
	  },
	  mapData: function mapData(data, maskPattern) {
	    var inc = -1;
	    var row = this.moduleCount - 1;
	    var bitIndex = 7;
	    var byteIndex = 0;

	    for (var col = this.moduleCount - 1; col > 0; col -= 2) {
	      if (col == 6) col--;

	      while (true) {
	        for (var c = 0; c < 2; c++) {
	          if (this.modules[row][col - c] == null) {
	            var dark = false;

	            if (byteIndex < data.length) {
	              dark = (data[byteIndex] >>> bitIndex & 1) == 1;
	            }

	            var mask = QRUtil.getMask(maskPattern, row, col - c);

	            if (mask) {
	              dark = !dark;
	            }

	            this.modules[row][col - c] = dark;
	            bitIndex--;

	            if (bitIndex == -1) {
	              byteIndex++;
	              bitIndex = 7;
	            }
	          }
	        }

	        row += inc;

	        if (row < 0 || this.moduleCount <= row) {
	          row -= inc;
	          inc = -inc;
	          break;
	        }
	      }
	    }
	  }
	};
	QRCodeModel.PAD0 = 0xEC;
	QRCodeModel.PAD1 = 0x11;

	QRCodeModel.createData = function (typeNumber, errorCorrectLevel, dataList) {
	  var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
	  var buffer = new QRBitBuffer();

	  for (var i = 0; i < dataList.length; i++) {
	    var data = dataList[i];
	    buffer.put(data.mode, 4);
	    buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber));
	    data.write(buffer);
	  }

	  var totalDataCount = 0;

	  for (var i = 0; i < rsBlocks.length; i++) {
	    totalDataCount += rsBlocks[i].dataCount;
	  }

	  if (buffer.getLengthInBits() > totalDataCount * 8) {
	    throw new Error("code length overflow. (" + buffer.getLengthInBits() + ">" + totalDataCount * 8 + ")");
	  }

	  if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
	    buffer.put(0, 4);
	  }

	  while (buffer.getLengthInBits() % 8 != 0) {
	    buffer.putBit(false);
	  }

	  while (true) {
	    if (buffer.getLengthInBits() >= totalDataCount * 8) {
	      break;
	    }

	    buffer.put(QRCodeModel.PAD0, 8);

	    if (buffer.getLengthInBits() >= totalDataCount * 8) {
	      break;
	    }

	    buffer.put(QRCodeModel.PAD1, 8);
	  }

	  return QRCodeModel.createBytes(buffer, rsBlocks);
	};

	QRCodeModel.createBytes = function (buffer, rsBlocks) {
	  var offset = 0;
	  var maxDcCount = 0;
	  var maxEcCount = 0;
	  var dcdata = new Array(rsBlocks.length);
	  var ecdata = new Array(rsBlocks.length);

	  for (var r = 0; r < rsBlocks.length; r++) {
	    var dcCount = rsBlocks[r].dataCount;
	    var ecCount = rsBlocks[r].totalCount - dcCount;
	    maxDcCount = Math.max(maxDcCount, dcCount);
	    maxEcCount = Math.max(maxEcCount, ecCount);
	    dcdata[r] = new Array(dcCount);

	    for (var i = 0; i < dcdata[r].length; i++) {
	      dcdata[r][i] = 0xff & buffer.buffer[i + offset];
	    }

	    offset += dcCount;
	    var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
	    var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
	    var modPoly = rawPoly.mod(rsPoly);
	    ecdata[r] = new Array(rsPoly.getLength() - 1);

	    for (var i = 0; i < ecdata[r].length; i++) {
	      var modIndex = i + modPoly.getLength() - ecdata[r].length;
	      ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
	    }
	  }

	  var totalCodeCount = 0;

	  for (var i = 0; i < rsBlocks.length; i++) {
	    totalCodeCount += rsBlocks[i].totalCount;
	  }

	  var data = new Array(totalCodeCount);
	  var index = 0;

	  for (var i = 0; i < maxDcCount; i++) {
	    for (var r = 0; r < rsBlocks.length; r++) {
	      if (i < dcdata[r].length) {
	        data[index++] = dcdata[r][i];
	      }
	    }
	  }

	  for (var i = 0; i < maxEcCount; i++) {
	    for (var r = 0; r < rsBlocks.length; r++) {
	      if (i < ecdata[r].length) {
	        data[index++] = ecdata[r][i];
	      }
	    }
	  }

	  return data;
	};

	var QRMode = {
	  MODE_NUMBER: 1 << 0,
	  MODE_ALPHA_NUM: 1 << 1,
	  MODE_8BIT_BYTE: 1 << 2,
	  MODE_KANJI: 1 << 3
	};
	var QRErrorCorrectLevel = {
	  L: 1,
	  M: 0,
	  Q: 3,
	  H: 2
	};
	var QRMaskPattern = {
	  PATTERN000: 0,
	  PATTERN001: 1,
	  PATTERN010: 2,
	  PATTERN011: 3,
	  PATTERN100: 4,
	  PATTERN101: 5,
	  PATTERN110: 6,
	  PATTERN111: 7
	};
	var QRUtil = {
	  PATTERN_POSITION_TABLE: [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]],
	  G15: 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0,
	  G18: 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0,
	  G15_MASK: 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1,
	  getBCHTypeInfo: function getBCHTypeInfo(data) {
	    var d = data << 10;

	    while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
	      d ^= QRUtil.G15 << QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15);
	    }

	    return (data << 10 | d) ^ QRUtil.G15_MASK;
	  },
	  getBCHTypeNumber: function getBCHTypeNumber(data) {
	    var d = data << 12;

	    while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
	      d ^= QRUtil.G18 << QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18);
	    }

	    return data << 12 | d;
	  },
	  getBCHDigit: function getBCHDigit(data) {
	    var digit = 0;

	    while (data != 0) {
	      digit++;
	      data >>>= 1;
	    }

	    return digit;
	  },
	  getPatternPosition: function getPatternPosition(typeNumber) {
	    return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
	  },
	  getMask: function getMask(maskPattern, i, j) {
	    switch (maskPattern) {
	      case QRMaskPattern.PATTERN000:
	        return (i + j) % 2 == 0;

	      case QRMaskPattern.PATTERN001:
	        return i % 2 == 0;

	      case QRMaskPattern.PATTERN010:
	        return j % 3 == 0;

	      case QRMaskPattern.PATTERN011:
	        return (i + j) % 3 == 0;

	      case QRMaskPattern.PATTERN100:
	        return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;

	      case QRMaskPattern.PATTERN101:
	        return i * j % 2 + i * j % 3 == 0;

	      case QRMaskPattern.PATTERN110:
	        return (i * j % 2 + i * j % 3) % 2 == 0;

	      case QRMaskPattern.PATTERN111:
	        return (i * j % 3 + (i + j) % 2) % 2 == 0;

	      default:
	        throw new Error("bad maskPattern:" + maskPattern);
	    }
	  },
	  getErrorCorrectPolynomial: function getErrorCorrectPolynomial(errorCorrectLength) {
	    var a = new QRPolynomial([1], 0);

	    for (var i = 0; i < errorCorrectLength; i++) {
	      a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
	    }

	    return a;
	  },
	  getLengthInBits: function getLengthInBits(mode, type) {
	    if (1 <= type && type < 10) {
	      switch (mode) {
	        case QRMode.MODE_NUMBER:
	          return 10;

	        case QRMode.MODE_ALPHA_NUM:
	          return 9;

	        case QRMode.MODE_8BIT_BYTE:
	          return 8;

	        case QRMode.MODE_KANJI:
	          return 8;

	        default:
	          throw new Error("mode:" + mode);
	      }
	    } else if (type < 27) {
	      switch (mode) {
	        case QRMode.MODE_NUMBER:
	          return 12;

	        case QRMode.MODE_ALPHA_NUM:
	          return 11;

	        case QRMode.MODE_8BIT_BYTE:
	          return 16;

	        case QRMode.MODE_KANJI:
	          return 10;

	        default:
	          throw new Error("mode:" + mode);
	      }
	    } else if (type < 41) {
	      switch (mode) {
	        case QRMode.MODE_NUMBER:
	          return 14;

	        case QRMode.MODE_ALPHA_NUM:
	          return 13;

	        case QRMode.MODE_8BIT_BYTE:
	          return 16;

	        case QRMode.MODE_KANJI:
	          return 12;

	        default:
	          throw new Error("mode:" + mode);
	      }
	    } else {
	      throw new Error("type:" + type);
	    }
	  },
	  getLostPoint: function getLostPoint(qrCode) {
	    var moduleCount = qrCode.getModuleCount();
	    var lostPoint = 0;

	    for (var row = 0; row < moduleCount; row++) {
	      for (var col = 0; col < moduleCount; col++) {
	        var sameCount = 0;
	        var dark = qrCode.isDark(row, col);

	        for (var r = -1; r <= 1; r++) {
	          if (row + r < 0 || moduleCount <= row + r) {
	            continue;
	          }

	          for (var c = -1; c <= 1; c++) {
	            if (col + c < 0 || moduleCount <= col + c) {
	              continue;
	            }

	            if (r == 0 && c == 0) {
	              continue;
	            }

	            if (dark == qrCode.isDark(row + r, col + c)) {
	              sameCount++;
	            }
	          }
	        }

	        if (sameCount > 5) {
	          lostPoint += 3 + sameCount - 5;
	        }
	      }
	    }

	    for (var row = 0; row < moduleCount - 1; row++) {
	      for (var col = 0; col < moduleCount - 1; col++) {
	        var count = 0;
	        if (qrCode.isDark(row, col)) count++;
	        if (qrCode.isDark(row + 1, col)) count++;
	        if (qrCode.isDark(row, col + 1)) count++;
	        if (qrCode.isDark(row + 1, col + 1)) count++;

	        if (count == 0 || count == 4) {
	          lostPoint += 3;
	        }
	      }
	    }

	    for (var row = 0; row < moduleCount; row++) {
	      for (var col = 0; col < moduleCount - 6; col++) {
	        if (qrCode.isDark(row, col) && !qrCode.isDark(row, col + 1) && qrCode.isDark(row, col + 2) && qrCode.isDark(row, col + 3) && qrCode.isDark(row, col + 4) && !qrCode.isDark(row, col + 5) && qrCode.isDark(row, col + 6)) {
	          lostPoint += 40;
	        }
	      }
	    }

	    for (var col = 0; col < moduleCount; col++) {
	      for (var row = 0; row < moduleCount - 6; row++) {
	        if (qrCode.isDark(row, col) && !qrCode.isDark(row + 1, col) && qrCode.isDark(row + 2, col) && qrCode.isDark(row + 3, col) && qrCode.isDark(row + 4, col) && !qrCode.isDark(row + 5, col) && qrCode.isDark(row + 6, col)) {
	          lostPoint += 40;
	        }
	      }
	    }

	    var darkCount = 0;

	    for (var col = 0; col < moduleCount; col++) {
	      for (var row = 0; row < moduleCount; row++) {
	        if (qrCode.isDark(row, col)) {
	          darkCount++;
	        }
	      }
	    }

	    var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
	    lostPoint += ratio * 10;
	    return lostPoint;
	  }
	};
	var QRMath = {
	  glog: function glog(n) {
	    if (n < 1) {
	      throw new Error("glog(" + n + ")");
	    }

	    return QRMath.LOG_TABLE[n];
	  },
	  gexp: function gexp(n) {
	    while (n < 0) {
	      n += 255;
	    }

	    while (n >= 256) {
	      n -= 255;
	    }

	    return QRMath.EXP_TABLE[n];
	  },
	  EXP_TABLE: new Array(256),
	  LOG_TABLE: new Array(256)
	};

	for (var i = 0; i < 8; i++) {
	  QRMath.EXP_TABLE[i] = 1 << i;
	}

	for (var i = 8; i < 256; i++) {
	  QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
	}

	for (var i = 0; i < 255; i++) {
	  QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
	}

	function QRPolynomial(num, shift) {
	  if (num.length == undefined) {
	    throw new Error(num.length + "/" + shift);
	  }

	  var offset = 0;

	  while (offset < num.length && num[offset] == 0) {
	    offset++;
	  }

	  this.num = new Array(num.length - offset + shift);

	  for (var i = 0; i < num.length - offset; i++) {
	    this.num[i] = num[i + offset];
	  }
	}

	QRPolynomial.prototype = {
	  get: function get(index) {
	    return this.num[index];
	  },
	  getLength: function getLength() {
	    return this.num.length;
	  },
	  multiply: function multiply(e) {
	    var num = new Array(this.getLength() + e.getLength() - 1);

	    for (var i = 0; i < this.getLength(); i++) {
	      for (var j = 0; j < e.getLength(); j++) {
	        num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
	      }
	    }

	    return new QRPolynomial(num, 0);
	  },
	  mod: function mod(e) {
	    if (this.getLength() - e.getLength() < 0) {
	      return this;
	    }

	    var ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
	    var num = new Array(this.getLength());

	    for (var i = 0; i < this.getLength(); i++) {
	      num[i] = this.get(i);
	    }

	    for (var i = 0; i < e.getLength(); i++) {
	      num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
	    }

	    return new QRPolynomial(num, 0).mod(e);
	  }
	};

	function QRRSBlock(totalCount, dataCount) {
	  this.totalCount = totalCount;
	  this.dataCount = dataCount;
	}

	QRRSBlock.RS_BLOCK_TABLE = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]];

	QRRSBlock.getRSBlocks = function (typeNumber, errorCorrectLevel) {
	  var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);

	  if (rsBlock == undefined) {
	    throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
	  }

	  var length = rsBlock.length / 3;
	  var list = [];

	  for (var i = 0; i < length; i++) {
	    var count = rsBlock[i * 3 + 0];
	    var totalCount = rsBlock[i * 3 + 1];
	    var dataCount = rsBlock[i * 3 + 2];

	    for (var j = 0; j < count; j++) {
	      list.push(new QRRSBlock(totalCount, dataCount));
	    }
	  }

	  return list;
	};

	QRRSBlock.getRsBlockTable = function (typeNumber, errorCorrectLevel) {
	  switch (errorCorrectLevel) {
	    case QRErrorCorrectLevel.L:
	      return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];

	    case QRErrorCorrectLevel.M:
	      return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];

	    case QRErrorCorrectLevel.Q:
	      return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];

	    case QRErrorCorrectLevel.H:
	      return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];

	    default:
	      return undefined;
	  }
	};

	function QRBitBuffer() {
	  this.buffer = [];
	  this.length = 0;
	}

	QRBitBuffer.prototype = {
	  get: function get(index) {
	    var bufIndex = Math.floor(index / 8);
	    return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) == 1;
	  },
	  put: function put(num, length) {
	    for (var i = 0; i < length; i++) {
	      this.putBit((num >>> length - i - 1 & 1) == 1);
	    }
	  },
	  getLengthInBits: function getLengthInBits() {
	    return this.length;
	  },
	  putBit: function putBit(bit) {
	    var bufIndex = Math.floor(this.length / 8);

	    if (this.buffer.length <= bufIndex) {
	      this.buffer.push(0);
	    }

	    if (bit) {
	      this.buffer[bufIndex] |= 0x80 >>> this.length % 8;
	    }

	    this.length++;
	  }
	};
	var QRCodeLimitLength = [[17, 14, 11, 7], [32, 26, 20, 14], [53, 42, 32, 24], [78, 62, 46, 34], [106, 84, 60, 44], [134, 106, 74, 58], [154, 122, 86, 64], [192, 152, 108, 84], [230, 180, 130, 98], [271, 213, 151, 119], [321, 251, 177, 137], [367, 287, 203, 155], [425, 331, 241, 177], [458, 362, 258, 194], [520, 412, 292, 220], [586, 450, 322, 250], [644, 504, 364, 280], [718, 560, 394, 310], [792, 624, 442, 338], [858, 666, 482, 382], [929, 711, 509, 403], [1003, 779, 565, 439], [1091, 857, 611, 461], [1171, 911, 661, 511], [1273, 997, 715, 535], [1367, 1059, 751, 593], [1465, 1125, 805, 625], [1528, 1190, 868, 658], [1628, 1264, 908, 698], [1732, 1370, 982, 742], [1840, 1452, 1030, 790], [1952, 1538, 1112, 842], [2068, 1628, 1168, 898], [2188, 1722, 1228, 958], [2303, 1809, 1283, 983], [2431, 1911, 1351, 1051], [2563, 1989, 1423, 1093], [2699, 2099, 1499, 1139], [2809, 2213, 1579, 1219], [2953, 2331, 1663, 1273]];
	var useSVG = document.documentElement.tagName.toLowerCase() === "svg";
	var Drawing;

	if (useSVG) {
	  Drawing = function Drawing(el, htOption) {
	    this._el = el;
	    this._htOption = htOption;
	  };

	  Drawing.prototype.draw = function (oQRCode) {
	    var _htOption = this._htOption;
	    var _el = this._el;
	    var nCount = oQRCode.getModuleCount();
	    var nWidth = Math.floor(_htOption.width / nCount);
	    var nHeight = Math.floor(_htOption.height / nCount);
	    this.clear();

	    function makeSVG(tag, attrs) {
	      var el = document.createElementNS('http://www.w3.org/2000/svg', tag);

	      for (var k in attrs) {
	        if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
	      }

	      return el;
	    }

	    var svg = makeSVG("svg", {
	      'viewBox': '0 0 ' + String(nCount) + " " + String(nCount),
	      'width': '100%',
	      'height': '100%',
	      'fill': _htOption.colorLight
	    });
	    svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

	    _el.appendChild(svg);

	    svg.appendChild(makeSVG("rect", {
	      "fill": _htOption.colorLight,
	      "width": "100%",
	      "height": "100%"
	    }));
	    svg.appendChild(makeSVG("rect", {
	      "fill": _htOption.colorDark,
	      "width": "1",
	      "height": "1",
	      "id": "template"
	    }));

	    for (var row = 0; row < nCount; row++) {
	      for (var col = 0; col < nCount; col++) {
	        if (oQRCode.isDark(row, col)) {
	          var child = makeSVG("use", {
	            "x": String(col),
	            "y": String(row)
	          });
	          child.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#template");
	          svg.appendChild(child);
	        }
	      }
	    }
	  };

	  Drawing.prototype.clear = function () {
	    while (this._el.hasChildNodes()) {
	      this._el.removeChild(this._el.lastChild);
	    }
	  };
	} else {
	  /**
	   * Drawing QRCode by using canvas
	   *
	   * @constructor
	   * @param {HTMLElement} el
	   * @param {Object} htOption QRCode Options
	   */
	  Drawing = function Drawing(el, htOption) {
	    this._bIsPainted = false;
	    this._htOption = htOption;
	    this._elCanvas = document.createElement("canvas");
	    this._elCanvas.width = htOption.width;
	    this._elCanvas.height = htOption.height;
	    el.appendChild(this._elCanvas);
	    this._el = el;
	    this._oContext = this._elCanvas.getContext("2d");
	    this._bIsPainted = false;
	    this._elImage = document.createElement("img");
	    this._elImage.alt = "Scan me!";
	    this._elImage.style.display = "none";

	    this._el.appendChild(this._elImage);

	    this._bSupportDataURI = null;
	  };
	  /**
	   * Draw the QRCode
	   *
	   * @param {QRCode} oQRCode
	   */


	  Drawing.prototype.draw = function (oQRCode) {
	    var _elImage = this._elImage;
	    var _oContext = this._oContext;
	    var _htOption = this._htOption;
	    var nCount = oQRCode.getModuleCount();
	    var nWidth = _htOption.width / nCount;
	    var nHeight = _htOption.height / nCount;
	    var nRoundedWidth = Math.round(nWidth);
	    var nRoundedHeight = Math.round(nHeight);
	    _elImage.style.display = "none";
	    this.clear();

	    for (var row = 0; row < nCount; row++) {
	      for (var col = 0; col < nCount; col++) {
	        var bIsDark = oQRCode.isDark(row, col);
	        var nLeft = col * nWidth;
	        var nTop = row * nHeight;
	        _oContext.strokeStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
	        _oContext.lineWidth = 1;
	        _oContext.fillStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;

	        _oContext.fillRect(nLeft, nTop, nWidth, nHeight); // 안티 앨리어싱 방지 처리


	        _oContext.strokeRect(Math.floor(nLeft) + 0.5, Math.floor(nTop) + 0.5, nRoundedWidth, nRoundedHeight);

	        _oContext.strokeRect(Math.ceil(nLeft) - 0.5, Math.ceil(nTop) - 0.5, nRoundedWidth, nRoundedHeight);
	      }
	    }

	    this._bIsPainted = true;
	  };
	  /**
	   * Make the image from Canvas if the browser supports Data URI.
	   */


	  Drawing.prototype.makeImage = function () {
	    if (this._bIsPainted) {
	      this._elImage.src = this._elCanvas.toDataURL("image/png");
	      this._elImage.style.display = "block";
	      this._elCanvas.style.display = "none";
	    }
	  };
	  /**
	   * Return whether the QRCode is painted or not
	   *
	   * @return {Boolean}
	   */


	  Drawing.prototype.isPainted = function () {
	    return this._bIsPainted;
	  };
	  /**
	   * Clear the QRCode
	   */


	  Drawing.prototype.clear = function () {
	    this._oContext.clearRect(0, 0, this._elCanvas.width, this._elCanvas.height);

	    this._bIsPainted = false;
	  };
	  /**
	   * @private
	   * @param {Number} nNumber
	   */


	  Drawing.prototype.round = function (nNumber) {
	    if (!nNumber) {
	      return nNumber;
	    }

	    return Math.floor(nNumber * 1000) / 1000;
	  };
	}
	/**
	 * Get the type by string length
	 *
	 * @private
	 * @param {String} sText
	 * @param {Number} nCorrectLevel
	 * @return {Number} type
	 */


	function _getTypeNumber(sText, nCorrectLevel) {
	  var nType = 1;

	  var length = _getUTF8Length(sText);

	  for (var i = 0, len = QRCodeLimitLength.length; i <= len; i++) {
	    var nLimit = 0;

	    switch (nCorrectLevel) {
	      case QRErrorCorrectLevel.L:
	        nLimit = QRCodeLimitLength[i][0];
	        break;

	      case QRErrorCorrectLevel.M:
	        nLimit = QRCodeLimitLength[i][1];
	        break;

	      case QRErrorCorrectLevel.Q:
	        nLimit = QRCodeLimitLength[i][2];
	        break;

	      case QRErrorCorrectLevel.H:
	        nLimit = QRCodeLimitLength[i][3];
	        break;
	    }

	    if (length <= nLimit) {
	      break;
	    } else {
	      nType++;
	    }
	  }

	  if (nType > QRCodeLimitLength.length) {
	    throw new Error("Too long data");
	  }

	  return nType;
	}

	function _getUTF8Length(sText) {
	  var replacedText = encodeURI(sText).toString().replace(/\%[0-9a-fA-F]{2}/g, 'a');
	  return replacedText.length + (replacedText.length != sText ? 3 : 0);
	}
	/**
	 * @class QRCode
	 * @constructor
	 * @example
	 * new QRCode(document.getElementById("test"), "http://jindo.dev.naver.com/collie");
	 *
	 * @example
	 * var oQRCode = new QRCode("test", {
	 *    text : "http://naver.com",
	 *    width : 128,
	 *    height : 128
	 * });
	 *
	 * oQRCode.clear(); // Clear the QRCode.
	 * oQRCode.makeCode("http://map.naver.com"); // Re-create the QRCode.
	 *
	 * @param {HTMLElement|String} el target element or 'id' attribute of element.
	 * @param {Object|String} vOption
	 * @param {String} vOption.text QRCode link data
	 * @param {Number} [vOption.width=256]
	 * @param {Number} [vOption.height=256]
	 * @param {String} [vOption.colorDark="#000000"]
	 * @param {String} [vOption.colorLight="#ffffff"]
	 * @param {QRCode.CorrectLevel} [vOption.correctLevel=QRCode.CorrectLevel.H] [L|M|Q|H]
	 */


	var QRCode = function QRCode(el, vOption) {
	  this._htOption = {
	    width: 256,
	    height: 256,
	    typeNumber: 4,
	    colorDark: "#000000",
	    colorLight: "#ffffff",
	    correctLevel: QRErrorCorrectLevel.H
	  };

	  if (typeof vOption === 'string') {
	    vOption = {
	      text: vOption
	    };
	  } // Overwrites options


	  if (vOption) {
	    for (var i in vOption) {
	      this._htOption[i] = vOption[i];
	    }
	  }

	  if (typeof el == "string") {
	    el = document.getElementById(el);
	  }

	  if (this._htOption.useSVG) {
	    Drawing = svgDrawer;
	  }

	  this._el = el;
	  this._oQRCode = null;
	  this._oDrawing = new Drawing(this._el, this._htOption);

	  if (this._htOption.text) {
	    this.makeCode(this._htOption.text);
	  }
	};
	/**
	 * Make the QRCode
	 *
	 * @param {String} sText link data
	 */


	QRCode.prototype.makeCode = function (sText) {
	  this._oQRCode = new QRCodeModel(_getTypeNumber(sText, this._htOption.correctLevel), this._htOption.correctLevel);

	  this._oQRCode.addData(sText);

	  this._oQRCode.make();

	  this._el.title = sText;

	  this._oDrawing.draw(this._oQRCode);

	  this.makeImage();
	};
	/**
	 * Make the Image from Canvas element
	 * - It occurs automatically
	 * - Android below 3 doesn't support Data-URI spec.
	 *
	 * @private
	 */


	QRCode.prototype.makeImage = function () {
	  if (typeof this._oDrawing.makeImage == "function") {
	    this._oDrawing.makeImage();
	  }
	};
	/**
	 * Clear the QRCode
	 */


	QRCode.prototype.clear = function () {
	  this._oDrawing.clear();
	};
	/**
	 * @name QRCode.CorrectLevel
	 */


	QRCode.CorrectLevel = QRErrorCorrectLevel;

	var ShareController = function ShareController($appContainer, browser, shareConfig) {
	  _classCallCheck(this, ShareController);

	  var embedTarget = shareConfig.embedTarget || getEmbedTarget();
	  shareConfig.$modal.on('show.bs.modal', /*#__PURE__*/function () {
	    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(e) {
	      var href, idx, session, snippet, shortURL, obj, qrcode, _obj;

	      return regeneratorRuntime.wrap(function _callee$(_context) {
	        while (1) {
	          switch (_context.prev = _context.next) {
	            case 0:
	              href = window.location.href.slice();
	              idx = href.indexOf("?");

	              if (idx > 0) {
	                href = href.substring(0, idx);
	              }

	              session = Globals.browser.compressedSession();

	              if (embedTarget) {
	                snippet = getEmbeddableSnippet($appContainer, embedTarget, session);
	                shareConfig.$embed_container.find('textarea').val(snippet);
	                shareConfig.$embed_container.find('textarea').get(0).select();
	              }

	              _context.next = 7;
	              return shortSessionURL(href, session);

	            case 7:
	              shortURL = _context.sent;
	              shareConfig.$share_input.val(shortURL);
	              shareConfig.$share_input.get(0).select();
	              shareConfig.$email_button.attr('href', 'mailto:?body=' + shortURL); // QR code generation

	              shareConfig.$qrcode_image.empty();
	              obj = {
	                width: 128,
	                height: 128,
	                correctLevel: QRCode.CorrectLevel.H
	              };
	              qrcode = new QRCode(shareConfig.$qrcode_image.get(0), obj);
	              qrcode.makeCode(shortURL);

	              if (shareConfig.$tweet_button_container) {
	                shareConfig.$tweet_button_container.empty();
	                _obj = {
	                  text: ''
	                };
	                window.twttr.widgets.createShareButton(shortURL, shareConfig.$tweet_button_container.get(0), _obj);
	              }

	            case 16:
	            case "end":
	              return _context.stop();
	          }
	        }
	      }, _callee);
	    }));

	    return function (_x) {
	      return _ref.apply(this, arguments);
	    };
	  }());
	  shareConfig.$modal.on('hidden.bs.modal', function (e) {
	    shareConfig.$embed_container.hide();
	    shareConfig.$qrcode_image.hide();
	  });
	  shareConfig.$copy_link_button.on('click', function (e) {
	    shareConfig.$share_input.get(0).select();
	    var success = document.execCommand('copy');

	    if (success) {
	      shareConfig.$modal.modal('hide');
	    }
	  });

	  if (undefined === embedTarget) {
	    shareConfig.$embed_button.hide();
	  } else {
	    shareConfig.$embed_container.find('button').on('click', function (e) {
	      var success;
	      shareConfig.$embed_container.find('textarea').get(0).select();
	      success = document.execCommand('copy');

	      if (success) {
	        shareConfig.$modal.modal('hide');
	      }
	    });
	    shareConfig.$embed_button.on('click', function (e) {
	      shareConfig.$qrcode_image.hide();
	      shareConfig.$embed_container.toggle();
	    });
	  }

	  shareConfig.$qrcode_button.on('click', function (e) {
	    shareConfig.$embed_container.hide();
	    shareConfig.$qrcode_image.toggle();
	  });
	};

	function getEmbeddableSnippet($appContainer, embedTarget, session) {
	  var embedUrl = embedTarget + "?sessionURL=blob:" + session;
	  var height = $appContainer.height() + 50;
	  return '<iframe src="' + embedUrl + '" style="width:100%; height:' + height + 'px"  allowfullscreen></iframe>';
	}
	/**
	 * Get the default embed html target.  Assumes an "embed.html" file in same directory as this page
	 */


	function getEmbedTarget() {
	  var href = window.location.href.slice();
	  var idx = href.indexOf("?");

	  if (idx > 0) {
	    href = href.substring(0, idx);
	  }

	  idx = href.lastIndexOf("/");
	  return href.substring(0, idx) + "/embed.html";
	}

	var ITERATOR$6 = wellKnownSymbol('iterator');
	var nativeUrl = !fails(function () {
	  var url = new URL('b?a=1&b=2&c=3', 'http://a');
	  var searchParams = url.searchParams;
	  var result = '';
	  url.pathname = 'c%20d';
	  searchParams.forEach(function (value, key) {
	    searchParams['delete']('b');
	    result += key + value;
	  });
	  return isPure && !url.toJSON || !searchParams.sort || url.href !== 'http://a/c%20d?a=1&c=3' || searchParams.get('c') !== '3' || String(new URLSearchParams('?a=1')) !== 'a=1' || !searchParams[ITERATOR$6] // throws in Edge
	  || new URL('https://a@b').username !== 'a' || new URLSearchParams(new URLSearchParams('a=b')).get('a') !== 'b' // not punycoded in Edge
	  || new URL('http://тест').host !== 'xn--e1aybc' // not escaped in Chrome 62-
	  || new URL('http://a#б').hash !== '#%D0%B1' // fails in Chrome 66-
	  || result !== 'a1c3' // throws in Safari
	  || new URL('http://x', undefined).host !== 'x';
	});

	var nativeAssign = Object.assign;
	var defineProperty$6 = Object.defineProperty; // `Object.assign` method
	// https://tc39.github.io/ecma262/#sec-object.assign

	var objectAssign = !nativeAssign || fails(function () {
	  // should have correct order of operations (Edge bug)
	  if (descriptors && nativeAssign({
	    b: 1
	  }, nativeAssign(defineProperty$6({}, 'a', {
	    enumerable: true,
	    get: function () {
	      defineProperty$6(this, 'b', {
	        value: 3,
	        enumerable: false
	      });
	    }
	  }), {
	    b: 2
	  })).b !== 1) return true; // should work with symbols and should have deterministic property order (V8 bug)

	  var A = {};
	  var B = {}; // eslint-disable-next-line no-undef

	  var symbol = Symbol();
	  var alphabet = 'abcdefghijklmnopqrst';
	  A[symbol] = 7;
	  alphabet.split('').forEach(function (chr) {
	    B[chr] = chr;
	  });
	  return nativeAssign({}, A)[symbol] != 7 || objectKeys(nativeAssign({}, B)).join('') != alphabet;
	}) ? function assign(target, source) {
	  // eslint-disable-line no-unused-vars
	  var T = toObject(target);
	  var argumentsLength = arguments.length;
	  var index = 1;
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  var propertyIsEnumerable = objectPropertyIsEnumerable.f;

	  while (argumentsLength > index) {
	    var S = indexedObject(arguments[index++]);
	    var keys = getOwnPropertySymbols ? objectKeys(S).concat(getOwnPropertySymbols(S)) : objectKeys(S);
	    var length = keys.length;
	    var j = 0;
	    var key;

	    while (length > j) {
	      key = keys[j++];
	      if (!descriptors || propertyIsEnumerable.call(S, key)) T[key] = S[key];
	    }
	  }

	  return T;
	} : nativeAssign;

	var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

	var base = 36;
	var tMin = 1;
	var tMax = 26;
	var skew = 38;
	var damp = 700;
	var initialBias = 72;
	var initialN = 128; // 0x80

	var delimiter = '-'; // '\x2D'

	var regexNonASCII = /[^\0-\u007E]/; // non-ASCII chars

	var regexSeparators = /[.\u3002\uFF0E\uFF61]/g; // RFC 3490 separators

	var OVERFLOW_ERROR = 'Overflow: input needs wider integers to process';
	var baseMinusTMin = base - tMin;
	var floor$2 = Math.floor;
	var stringFromCharCode = String.fromCharCode;
	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 */

	var ucs2decode = function (string) {
	  var output = [];
	  var counter = 0;
	  var length = string.length;

	  while (counter < length) {
	    var value = string.charCodeAt(counter++);

	    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
	      // It's a high surrogate, and there is a next character.
	      var extra = string.charCodeAt(counter++);

	      if ((extra & 0xFC00) == 0xDC00) {
	        // Low surrogate.
	        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
	      } else {
	        // It's an unmatched surrogate; only append this code unit, in case the
	        // next code unit is the high surrogate of a surrogate pair.
	        output.push(value);
	        counter--;
	      }
	    } else {
	      output.push(value);
	    }
	  }

	  return output;
	};
	/**
	 * Converts a digit/integer into a basic code point.
	 */


	var digitToBasic = function (digit) {
	  //  0..25 map to ASCII a..z or A..Z
	  // 26..35 map to ASCII 0..9
	  return digit + 22 + 75 * (digit < 26);
	};
	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 */


	var adapt = function (delta, numPoints, firstTime) {
	  var k = 0;
	  delta = firstTime ? floor$2(delta / damp) : delta >> 1;
	  delta += floor$2(delta / numPoints);

	  for (; delta > baseMinusTMin * tMax >> 1; k += base) {
	    delta = floor$2(delta / baseMinusTMin);
	  }

	  return floor$2(k + (baseMinusTMin + 1) * delta / (delta + skew));
	};
	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 */
	// eslint-disable-next-line  max-statements


	var encode = function (input) {
	  var output = []; // Convert the input in UCS-2 to an array of Unicode code points.

	  input = ucs2decode(input); // Cache the length.

	  var inputLength = input.length; // Initialize the state.

	  var n = initialN;
	  var delta = 0;
	  var bias = initialBias;
	  var i, currentValue; // Handle the basic code points.

	  for (i = 0; i < input.length; i++) {
	    currentValue = input[i];

	    if (currentValue < 0x80) {
	      output.push(stringFromCharCode(currentValue));
	    }
	  }

	  var basicLength = output.length; // number of basic code points.

	  var handledCPCount = basicLength; // number of code points that have been handled;
	  // Finish the basic string with a delimiter unless it's empty.

	  if (basicLength) {
	    output.push(delimiter);
	  } // Main encoding loop:


	  while (handledCPCount < inputLength) {
	    // All non-basic code points < n have been handled already. Find the next larger one:
	    var m = maxInt;

	    for (i = 0; i < input.length; i++) {
	      currentValue = input[i];

	      if (currentValue >= n && currentValue < m) {
	        m = currentValue;
	      }
	    } // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>, but guard against overflow.


	    var handledCPCountPlusOne = handledCPCount + 1;

	    if (m - n > floor$2((maxInt - delta) / handledCPCountPlusOne)) {
	      throw RangeError(OVERFLOW_ERROR);
	    }

	    delta += (m - n) * handledCPCountPlusOne;
	    n = m;

	    for (i = 0; i < input.length; i++) {
	      currentValue = input[i];

	      if (currentValue < n && ++delta > maxInt) {
	        throw RangeError(OVERFLOW_ERROR);
	      }

	      if (currentValue == n) {
	        // Represent delta as a generalized variable-length integer.
	        var q = delta;

	        for (var k = base;;
	        /* no condition */
	        k += base) {
	          var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
	          if (q < t) break;
	          var qMinusT = q - t;
	          var baseMinusT = base - t;
	          output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT)));
	          q = floor$2(qMinusT / baseMinusT);
	        }

	        output.push(stringFromCharCode(digitToBasic(q)));
	        bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
	        delta = 0;
	        ++handledCPCount;
	      }
	    }

	    ++delta;
	    ++n;
	  }

	  return output.join('');
	};

	var stringPunycodeToAscii = function (input) {
	  var encoded = [];
	  var labels = input.toLowerCase().replace(regexSeparators, '\u002E').split('.');
	  var i, label;

	  for (i = 0; i < labels.length; i++) {
	    label = labels[i];
	    encoded.push(regexNonASCII.test(label) ? 'xn--' + encode(label) : label);
	  }

	  return encoded.join('.');
	};

	var getIterator = function (it) {
	  var iteratorMethod = getIteratorMethod(it);

	  if (typeof iteratorMethod != 'function') {
	    throw TypeError(String(it) + ' is not iterable');
	  }

	  return anObject(iteratorMethod.call(it));
	};

	var $fetch$1 = getBuiltIn('fetch');
	var Headers = getBuiltIn('Headers');
	var ITERATOR$7 = wellKnownSymbol('iterator');
	var URL_SEARCH_PARAMS = 'URLSearchParams';
	var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
	var setInternalState$5 = internalState.set;
	var getInternalParamsState = internalState.getterFor(URL_SEARCH_PARAMS);
	var getInternalIteratorState = internalState.getterFor(URL_SEARCH_PARAMS_ITERATOR);
	var plus = /\+/g;
	var sequences = Array(4);

	var percentSequence = function (bytes) {
	  return sequences[bytes - 1] || (sequences[bytes - 1] = RegExp('((?:%[\\da-f]{2}){' + bytes + '})', 'gi'));
	};

	var percentDecode = function (sequence) {
	  try {
	    return decodeURIComponent(sequence);
	  } catch (error) {
	    return sequence;
	  }
	};

	var deserialize = function (it) {
	  var result = it.replace(plus, ' ');
	  var bytes = 4;

	  try {
	    return decodeURIComponent(result);
	  } catch (error) {
	    while (bytes) {
	      result = result.replace(percentSequence(bytes--), percentDecode);
	    }

	    return result;
	  }
	};

	var find = /[!'()~]|%20/g;
	var replace = {
	  '!': '%21',
	  "'": '%27',
	  '(': '%28',
	  ')': '%29',
	  '~': '%7E',
	  '%20': '+'
	};

	var replacer = function (match) {
	  return replace[match];
	};

	var serialize = function (it) {
	  return encodeURIComponent(it).replace(find, replacer);
	};

	var parseSearchParams = function (result, query) {
	  if (query) {
	    var attributes = query.split('&');
	    var index = 0;
	    var attribute, entry;

	    while (index < attributes.length) {
	      attribute = attributes[index++];

	      if (attribute.length) {
	        entry = attribute.split('=');
	        result.push({
	          key: deserialize(entry.shift()),
	          value: deserialize(entry.join('='))
	        });
	      }
	    }
	  }
	};

	var updateSearchParams = function (query) {
	  this.entries.length = 0;
	  parseSearchParams(this.entries, query);
	};

	var validateArgumentsLength = function (passed, required) {
	  if (passed < required) throw TypeError('Not enough arguments');
	};

	var URLSearchParamsIterator = createIteratorConstructor(function Iterator(params, kind) {
	  setInternalState$5(this, {
	    type: URL_SEARCH_PARAMS_ITERATOR,
	    iterator: getIterator(getInternalParamsState(params).entries),
	    kind: kind
	  });
	}, 'Iterator', function next() {
	  var state = getInternalIteratorState(this);
	  var kind = state.kind;
	  var step = state.iterator.next();
	  var entry = step.value;

	  if (!step.done) {
	    step.value = kind === 'keys' ? entry.key : kind === 'values' ? entry.value : [entry.key, entry.value];
	  }

	  return step;
	}); // `URLSearchParams` constructor
	// https://url.spec.whatwg.org/#interface-urlsearchparams

	var URLSearchParamsConstructor = function URLSearchParams()
	/* init */
	{
	  anInstance(this, URLSearchParamsConstructor, URL_SEARCH_PARAMS);
	  var init = arguments.length > 0 ? arguments[0] : undefined;
	  var that = this;
	  var entries = [];
	  var iteratorMethod, iterator, next, step, entryIterator, entryNext, first, second, key;
	  setInternalState$5(that, {
	    type: URL_SEARCH_PARAMS,
	    entries: entries,
	    updateURL: function () {
	      /* empty */
	    },
	    updateSearchParams: updateSearchParams
	  });

	  if (init !== undefined) {
	    if (isObject(init)) {
	      iteratorMethod = getIteratorMethod(init);

	      if (typeof iteratorMethod === 'function') {
	        iterator = iteratorMethod.call(init);
	        next = iterator.next;

	        while (!(step = next.call(iterator)).done) {
	          entryIterator = getIterator(anObject(step.value));
	          entryNext = entryIterator.next;
	          if ((first = entryNext.call(entryIterator)).done || (second = entryNext.call(entryIterator)).done || !entryNext.call(entryIterator).done) throw TypeError('Expected sequence with length 2');
	          entries.push({
	            key: first.value + '',
	            value: second.value + ''
	          });
	        }
	      } else for (key in init) if (has(init, key)) entries.push({
	        key: key,
	        value: init[key] + ''
	      });
	    } else {
	      parseSearchParams(entries, typeof init === 'string' ? init.charAt(0) === '?' ? init.slice(1) : init : init + '');
	    }
	  }
	};

	var URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;
	redefineAll(URLSearchParamsPrototype, {
	  // `URLSearchParams.prototype.appent` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-append
	  append: function append(name, value) {
	    validateArgumentsLength(arguments.length, 2);
	    var state = getInternalParamsState(this);
	    state.entries.push({
	      key: name + '',
	      value: value + ''
	    });
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.delete` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-delete
	  'delete': function (name) {
	    validateArgumentsLength(arguments.length, 1);
	    var state = getInternalParamsState(this);
	    var entries = state.entries;
	    var key = name + '';
	    var index = 0;

	    while (index < entries.length) {
	      if (entries[index].key === key) entries.splice(index, 1);else index++;
	    }

	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.get` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-get
	  get: function get(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var index = 0;

	    for (; index < entries.length; index++) {
	      if (entries[index].key === key) return entries[index].value;
	    }

	    return null;
	  },
	  // `URLSearchParams.prototype.getAll` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-getall
	  getAll: function getAll(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var result = [];
	    var index = 0;

	    for (; index < entries.length; index++) {
	      if (entries[index].key === key) result.push(entries[index].value);
	    }

	    return result;
	  },
	  // `URLSearchParams.prototype.has` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-has
	  has: function has(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var index = 0;

	    while (index < entries.length) {
	      if (entries[index++].key === key) return true;
	    }

	    return false;
	  },
	  // `URLSearchParams.prototype.set` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-set
	  set: function set(name, value) {
	    validateArgumentsLength(arguments.length, 1);
	    var state = getInternalParamsState(this);
	    var entries = state.entries;
	    var found = false;
	    var key = name + '';
	    var val = value + '';
	    var index = 0;
	    var entry;

	    for (; index < entries.length; index++) {
	      entry = entries[index];

	      if (entry.key === key) {
	        if (found) entries.splice(index--, 1);else {
	          found = true;
	          entry.value = val;
	        }
	      }
	    }

	    if (!found) entries.push({
	      key: key,
	      value: val
	    });
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.sort` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-sort
	  sort: function sort() {
	    var state = getInternalParamsState(this);
	    var entries = state.entries; // Array#sort is not stable in some engines

	    var slice = entries.slice();
	    var entry, entriesIndex, sliceIndex;
	    entries.length = 0;

	    for (sliceIndex = 0; sliceIndex < slice.length; sliceIndex++) {
	      entry = slice[sliceIndex];

	      for (entriesIndex = 0; entriesIndex < sliceIndex; entriesIndex++) {
	        if (entries[entriesIndex].key > entry.key) {
	          entries.splice(entriesIndex, 0, entry);
	          break;
	        }
	      }

	      if (entriesIndex === sliceIndex) entries.push(entry);
	    }

	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.forEach` method
	  forEach: function forEach(callback
	  /* , thisArg */
	  ) {
	    var entries = getInternalParamsState(this).entries;
	    var boundFunction = functionBindContext(callback, arguments.length > 1 ? arguments[1] : undefined, 3);
	    var index = 0;
	    var entry;

	    while (index < entries.length) {
	      entry = entries[index++];
	      boundFunction(entry.value, entry.key, this);
	    }
	  },
	  // `URLSearchParams.prototype.keys` method
	  keys: function keys() {
	    return new URLSearchParamsIterator(this, 'keys');
	  },
	  // `URLSearchParams.prototype.values` method
	  values: function values() {
	    return new URLSearchParamsIterator(this, 'values');
	  },
	  // `URLSearchParams.prototype.entries` method
	  entries: function entries() {
	    return new URLSearchParamsIterator(this, 'entries');
	  }
	}, {
	  enumerable: true
	}); // `URLSearchParams.prototype[@@iterator]` method

	redefine(URLSearchParamsPrototype, ITERATOR$7, URLSearchParamsPrototype.entries); // `URLSearchParams.prototype.toString` method
	// https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior

	redefine(URLSearchParamsPrototype, 'toString', function toString() {
	  var entries = getInternalParamsState(this).entries;
	  var result = [];
	  var index = 0;
	  var entry;

	  while (index < entries.length) {
	    entry = entries[index++];
	    result.push(serialize(entry.key) + '=' + serialize(entry.value));
	  }

	  return result.join('&');
	}, {
	  enumerable: true
	});
	setToStringTag(URLSearchParamsConstructor, URL_SEARCH_PARAMS);
	_export({
	  global: true,
	  forced: !nativeUrl
	}, {
	  URLSearchParams: URLSearchParamsConstructor
	}); // Wrap `fetch` for correct work with polyfilled `URLSearchParams`
	// https://github.com/zloirock/core-js/issues/674

	if (!nativeUrl && typeof $fetch$1 == 'function' && typeof Headers == 'function') {
	  _export({
	    global: true,
	    enumerable: true,
	    forced: true
	  }, {
	    fetch: function fetch(input
	    /* , init */
	    ) {
	      var args = [input];
	      var init, body, headers;

	      if (arguments.length > 1) {
	        init = arguments[1];

	        if (isObject(init)) {
	          body = init.body;

	          if (classof(body) === URL_SEARCH_PARAMS) {
	            headers = init.headers ? new Headers(init.headers) : new Headers();

	            if (!headers.has('content-type')) {
	              headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
	            }

	            init = objectCreate(init, {
	              body: createPropertyDescriptor(0, String(body)),
	              headers: createPropertyDescriptor(0, headers)
	            });
	          }
	        }

	        args.push(init);
	      }

	      return $fetch$1.apply(this, args);
	    }
	  });
	}

	var web_urlSearchParams = {
	  URLSearchParams: URLSearchParamsConstructor,
	  getState: getInternalParamsState
	};

	var codeAt = stringMultibyte.codeAt;
	var NativeURL = global_1.URL;
	var URLSearchParams$1 = web_urlSearchParams.URLSearchParams;
	var getInternalSearchParamsState = web_urlSearchParams.getState;
	var setInternalState$6 = internalState.set;
	var getInternalURLState = internalState.getterFor('URL');
	var floor$3 = Math.floor;
	var pow = Math.pow;
	var INVALID_AUTHORITY = 'Invalid authority';
	var INVALID_SCHEME = 'Invalid scheme';
	var INVALID_HOST = 'Invalid host';
	var INVALID_PORT = 'Invalid port';
	var ALPHA = /[A-Za-z]/;
	var ALPHANUMERIC = /[\d+\-.A-Za-z]/;
	var DIGIT = /\d/;
	var HEX_START = /^(0x|0X)/;
	var OCT = /^[0-7]+$/;
	var DEC = /^\d+$/;
	var HEX = /^[\dA-Fa-f]+$/; // eslint-disable-next-line no-control-regex

	var FORBIDDEN_HOST_CODE_POINT = /[\u0000\u0009\u000A\u000D #%/:?@[\\]]/; // eslint-disable-next-line no-control-regex

	var FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT = /[\u0000\u0009\u000A\u000D #/:?@[\\]]/; // eslint-disable-next-line no-control-regex

	var LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE = /^[\u0000-\u001F ]+|[\u0000-\u001F ]+$/g; // eslint-disable-next-line no-control-regex

	var TAB_AND_NEW_LINE = /[\u0009\u000A\u000D]/g;
	var EOF;

	var parseHost = function (url, input) {
	  var result, codePoints, index;

	  if (input.charAt(0) == '[') {
	    if (input.charAt(input.length - 1) != ']') return INVALID_HOST;
	    result = parseIPv6(input.slice(1, -1));
	    if (!result) return INVALID_HOST;
	    url.host = result; // opaque host
	  } else if (!isSpecial(url)) {
	    if (FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT.test(input)) return INVALID_HOST;
	    result = '';
	    codePoints = arrayFrom(input);

	    for (index = 0; index < codePoints.length; index++) {
	      result += percentEncode(codePoints[index], C0ControlPercentEncodeSet);
	    }

	    url.host = result;
	  } else {
	    input = stringPunycodeToAscii(input);
	    if (FORBIDDEN_HOST_CODE_POINT.test(input)) return INVALID_HOST;
	    result = parseIPv4(input);
	    if (result === null) return INVALID_HOST;
	    url.host = result;
	  }
	};

	var parseIPv4 = function (input) {
	  var parts = input.split('.');
	  var partsLength, numbers, index, part, radix, number, ipv4;

	  if (parts.length && parts[parts.length - 1] == '') {
	    parts.pop();
	  }

	  partsLength = parts.length;
	  if (partsLength > 4) return input;
	  numbers = [];

	  for (index = 0; index < partsLength; index++) {
	    part = parts[index];
	    if (part == '') return input;
	    radix = 10;

	    if (part.length > 1 && part.charAt(0) == '0') {
	      radix = HEX_START.test(part) ? 16 : 8;
	      part = part.slice(radix == 8 ? 1 : 2);
	    }

	    if (part === '') {
	      number = 0;
	    } else {
	      if (!(radix == 10 ? DEC : radix == 8 ? OCT : HEX).test(part)) return input;
	      number = parseInt(part, radix);
	    }

	    numbers.push(number);
	  }

	  for (index = 0; index < partsLength; index++) {
	    number = numbers[index];

	    if (index == partsLength - 1) {
	      if (number >= pow(256, 5 - partsLength)) return null;
	    } else if (number > 255) return null;
	  }

	  ipv4 = numbers.pop();

	  for (index = 0; index < numbers.length; index++) {
	    ipv4 += numbers[index] * pow(256, 3 - index);
	  }

	  return ipv4;
	}; // eslint-disable-next-line max-statements


	var parseIPv6 = function (input) {
	  var address = [0, 0, 0, 0, 0, 0, 0, 0];
	  var pieceIndex = 0;
	  var compress = null;
	  var pointer = 0;
	  var value, length, numbersSeen, ipv4Piece, number, swaps, swap;

	  var char = function () {
	    return input.charAt(pointer);
	  };

	  if (char() == ':') {
	    if (input.charAt(1) != ':') return;
	    pointer += 2;
	    pieceIndex++;
	    compress = pieceIndex;
	  }

	  while (char()) {
	    if (pieceIndex == 8) return;

	    if (char() == ':') {
	      if (compress !== null) return;
	      pointer++;
	      pieceIndex++;
	      compress = pieceIndex;
	      continue;
	    }

	    value = length = 0;

	    while (length < 4 && HEX.test(char())) {
	      value = value * 16 + parseInt(char(), 16);
	      pointer++;
	      length++;
	    }

	    if (char() == '.') {
	      if (length == 0) return;
	      pointer -= length;
	      if (pieceIndex > 6) return;
	      numbersSeen = 0;

	      while (char()) {
	        ipv4Piece = null;

	        if (numbersSeen > 0) {
	          if (char() == '.' && numbersSeen < 4) pointer++;else return;
	        }

	        if (!DIGIT.test(char())) return;

	        while (DIGIT.test(char())) {
	          number = parseInt(char(), 10);
	          if (ipv4Piece === null) ipv4Piece = number;else if (ipv4Piece == 0) return;else ipv4Piece = ipv4Piece * 10 + number;
	          if (ipv4Piece > 255) return;
	          pointer++;
	        }

	        address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
	        numbersSeen++;
	        if (numbersSeen == 2 || numbersSeen == 4) pieceIndex++;
	      }

	      if (numbersSeen != 4) return;
	      break;
	    } else if (char() == ':') {
	      pointer++;
	      if (!char()) return;
	    } else if (char()) return;

	    address[pieceIndex++] = value;
	  }

	  if (compress !== null) {
	    swaps = pieceIndex - compress;
	    pieceIndex = 7;

	    while (pieceIndex != 0 && swaps > 0) {
	      swap = address[pieceIndex];
	      address[pieceIndex--] = address[compress + swaps - 1];
	      address[compress + --swaps] = swap;
	    }
	  } else if (pieceIndex != 8) return;

	  return address;
	};

	var findLongestZeroSequence = function (ipv6) {
	  var maxIndex = null;
	  var maxLength = 1;
	  var currStart = null;
	  var currLength = 0;
	  var index = 0;

	  for (; index < 8; index++) {
	    if (ipv6[index] !== 0) {
	      if (currLength > maxLength) {
	        maxIndex = currStart;
	        maxLength = currLength;
	      }

	      currStart = null;
	      currLength = 0;
	    } else {
	      if (currStart === null) currStart = index;
	      ++currLength;
	    }
	  }

	  if (currLength > maxLength) {
	    maxIndex = currStart;
	    maxLength = currLength;
	  }

	  return maxIndex;
	};

	var serializeHost = function (host) {
	  var result, index, compress, ignore0; // ipv4

	  if (typeof host == 'number') {
	    result = [];

	    for (index = 0; index < 4; index++) {
	      result.unshift(host % 256);
	      host = floor$3(host / 256);
	    }

	    return result.join('.'); // ipv6
	  } else if (typeof host == 'object') {
	    result = '';
	    compress = findLongestZeroSequence(host);

	    for (index = 0; index < 8; index++) {
	      if (ignore0 && host[index] === 0) continue;
	      if (ignore0) ignore0 = false;

	      if (compress === index) {
	        result += index ? ':' : '::';
	        ignore0 = true;
	      } else {
	        result += host[index].toString(16);
	        if (index < 7) result += ':';
	      }
	    }

	    return '[' + result + ']';
	  }

	  return host;
	};

	var C0ControlPercentEncodeSet = {};
	var fragmentPercentEncodeSet = objectAssign({}, C0ControlPercentEncodeSet, {
	  ' ': 1,
	  '"': 1,
	  '<': 1,
	  '>': 1,
	  '`': 1
	});
	var pathPercentEncodeSet = objectAssign({}, fragmentPercentEncodeSet, {
	  '#': 1,
	  '?': 1,
	  '{': 1,
	  '}': 1
	});
	var userinfoPercentEncodeSet = objectAssign({}, pathPercentEncodeSet, {
	  '/': 1,
	  ':': 1,
	  ';': 1,
	  '=': 1,
	  '@': 1,
	  '[': 1,
	  '\\': 1,
	  ']': 1,
	  '^': 1,
	  '|': 1
	});

	var percentEncode = function (char, set) {
	  var code = codeAt(char, 0);
	  return code > 0x20 && code < 0x7F && !has(set, char) ? char : encodeURIComponent(char);
	};

	var specialSchemes = {
	  ftp: 21,
	  file: null,
	  http: 80,
	  https: 443,
	  ws: 80,
	  wss: 443
	};

	var isSpecial = function (url) {
	  return has(specialSchemes, url.scheme);
	};

	var includesCredentials = function (url) {
	  return url.username != '' || url.password != '';
	};

	var cannotHaveUsernamePasswordPort = function (url) {
	  return !url.host || url.cannotBeABaseURL || url.scheme == 'file';
	};

	var isWindowsDriveLetter = function (string, normalized) {
	  var second;
	  return string.length == 2 && ALPHA.test(string.charAt(0)) && ((second = string.charAt(1)) == ':' || !normalized && second == '|');
	};

	var startsWithWindowsDriveLetter = function (string) {
	  var third;
	  return string.length > 1 && isWindowsDriveLetter(string.slice(0, 2)) && (string.length == 2 || (third = string.charAt(2)) === '/' || third === '\\' || third === '?' || third === '#');
	};

	var shortenURLsPath = function (url) {
	  var path = url.path;
	  var pathSize = path.length;

	  if (pathSize && (url.scheme != 'file' || pathSize != 1 || !isWindowsDriveLetter(path[0], true))) {
	    path.pop();
	  }
	};

	var isSingleDot = function (segment) {
	  return segment === '.' || segment.toLowerCase() === '%2e';
	};

	var isDoubleDot = function (segment) {
	  segment = segment.toLowerCase();
	  return segment === '..' || segment === '%2e.' || segment === '.%2e' || segment === '%2e%2e';
	}; // States:


	var SCHEME_START = {};
	var SCHEME = {};
	var NO_SCHEME = {};
	var SPECIAL_RELATIVE_OR_AUTHORITY = {};
	var PATH_OR_AUTHORITY = {};
	var RELATIVE = {};
	var RELATIVE_SLASH = {};
	var SPECIAL_AUTHORITY_SLASHES = {};
	var SPECIAL_AUTHORITY_IGNORE_SLASHES = {};
	var AUTHORITY = {};
	var HOST = {};
	var HOSTNAME = {};
	var PORT = {};
	var FILE = {};
	var FILE_SLASH = {};
	var FILE_HOST = {};
	var PATH_START = {};
	var PATH = {};
	var CANNOT_BE_A_BASE_URL_PATH = {};
	var QUERY = {};
	var FRAGMENT = {}; // eslint-disable-next-line max-statements

	var parseURL = function (url, input, stateOverride, base) {
	  var state = stateOverride || SCHEME_START;
	  var pointer = 0;
	  var buffer = '';
	  var seenAt = false;
	  var seenBracket = false;
	  var seenPasswordToken = false;
	  var codePoints, char, bufferCodePoints, failure;

	  if (!stateOverride) {
	    url.scheme = '';
	    url.username = '';
	    url.password = '';
	    url.host = null;
	    url.port = null;
	    url.path = [];
	    url.query = null;
	    url.fragment = null;
	    url.cannotBeABaseURL = false;
	    input = input.replace(LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE, '');
	  }

	  input = input.replace(TAB_AND_NEW_LINE, '');
	  codePoints = arrayFrom(input);

	  while (pointer <= codePoints.length) {
	    char = codePoints[pointer];

	    switch (state) {
	      case SCHEME_START:
	        if (char && ALPHA.test(char)) {
	          buffer += char.toLowerCase();
	          state = SCHEME;
	        } else if (!stateOverride) {
	          state = NO_SCHEME;
	          continue;
	        } else return INVALID_SCHEME;

	        break;

	      case SCHEME:
	        if (char && (ALPHANUMERIC.test(char) || char == '+' || char == '-' || char == '.')) {
	          buffer += char.toLowerCase();
	        } else if (char == ':') {
	          if (stateOverride && (isSpecial(url) != has(specialSchemes, buffer) || buffer == 'file' && (includesCredentials(url) || url.port !== null) || url.scheme == 'file' && !url.host)) return;
	          url.scheme = buffer;

	          if (stateOverride) {
	            if (isSpecial(url) && specialSchemes[url.scheme] == url.port) url.port = null;
	            return;
	          }

	          buffer = '';

	          if (url.scheme == 'file') {
	            state = FILE;
	          } else if (isSpecial(url) && base && base.scheme == url.scheme) {
	            state = SPECIAL_RELATIVE_OR_AUTHORITY;
	          } else if (isSpecial(url)) {
	            state = SPECIAL_AUTHORITY_SLASHES;
	          } else if (codePoints[pointer + 1] == '/') {
	            state = PATH_OR_AUTHORITY;
	            pointer++;
	          } else {
	            url.cannotBeABaseURL = true;
	            url.path.push('');
	            state = CANNOT_BE_A_BASE_URL_PATH;
	          }
	        } else if (!stateOverride) {
	          buffer = '';
	          state = NO_SCHEME;
	          pointer = 0;
	          continue;
	        } else return INVALID_SCHEME;

	        break;

	      case NO_SCHEME:
	        if (!base || base.cannotBeABaseURL && char != '#') return INVALID_SCHEME;

	        if (base.cannotBeABaseURL && char == '#') {
	          url.scheme = base.scheme;
	          url.path = base.path.slice();
	          url.query = base.query;
	          url.fragment = '';
	          url.cannotBeABaseURL = true;
	          state = FRAGMENT;
	          break;
	        }

	        state = base.scheme == 'file' ? FILE : RELATIVE;
	        continue;

	      case SPECIAL_RELATIVE_OR_AUTHORITY:
	        if (char == '/' && codePoints[pointer + 1] == '/') {
	          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	          pointer++;
	        } else {
	          state = RELATIVE;
	          continue;
	        }

	        break;

	      case PATH_OR_AUTHORITY:
	        if (char == '/') {
	          state = AUTHORITY;
	          break;
	        } else {
	          state = PATH;
	          continue;
	        }

	      case RELATIVE:
	        url.scheme = base.scheme;

	        if (char == EOF) {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.query = base.query;
	        } else if (char == '/' || char == '\\' && isSpecial(url)) {
	          state = RELATIVE_SLASH;
	        } else if (char == '?') {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.query = '';
	          state = QUERY;
	        } else if (char == '#') {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.query = base.query;
	          url.fragment = '';
	          state = FRAGMENT;
	        } else {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.path.pop();
	          state = PATH;
	          continue;
	        }

	        break;

	      case RELATIVE_SLASH:
	        if (isSpecial(url) && (char == '/' || char == '\\')) {
	          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	        } else if (char == '/') {
	          state = AUTHORITY;
	        } else {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          state = PATH;
	          continue;
	        }

	        break;

	      case SPECIAL_AUTHORITY_SLASHES:
	        state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	        if (char != '/' || buffer.charAt(pointer + 1) != '/') continue;
	        pointer++;
	        break;

	      case SPECIAL_AUTHORITY_IGNORE_SLASHES:
	        if (char != '/' && char != '\\') {
	          state = AUTHORITY;
	          continue;
	        }

	        break;

	      case AUTHORITY:
	        if (char == '@') {
	          if (seenAt) buffer = '%40' + buffer;
	          seenAt = true;
	          bufferCodePoints = arrayFrom(buffer);

	          for (var i = 0; i < bufferCodePoints.length; i++) {
	            var codePoint = bufferCodePoints[i];

	            if (codePoint == ':' && !seenPasswordToken) {
	              seenPasswordToken = true;
	              continue;
	            }

	            var encodedCodePoints = percentEncode(codePoint, userinfoPercentEncodeSet);
	            if (seenPasswordToken) url.password += encodedCodePoints;else url.username += encodedCodePoints;
	          }

	          buffer = '';
	        } else if (char == EOF || char == '/' || char == '?' || char == '#' || char == '\\' && isSpecial(url)) {
	          if (seenAt && buffer == '') return INVALID_AUTHORITY;
	          pointer -= arrayFrom(buffer).length + 1;
	          buffer = '';
	          state = HOST;
	        } else buffer += char;

	        break;

	      case HOST:
	      case HOSTNAME:
	        if (stateOverride && url.scheme == 'file') {
	          state = FILE_HOST;
	          continue;
	        } else if (char == ':' && !seenBracket) {
	          if (buffer == '') return INVALID_HOST;
	          failure = parseHost(url, buffer);
	          if (failure) return failure;
	          buffer = '';
	          state = PORT;
	          if (stateOverride == HOSTNAME) return;
	        } else if (char == EOF || char == '/' || char == '?' || char == '#' || char == '\\' && isSpecial(url)) {
	          if (isSpecial(url) && buffer == '') return INVALID_HOST;
	          if (stateOverride && buffer == '' && (includesCredentials(url) || url.port !== null)) return;
	          failure = parseHost(url, buffer);
	          if (failure) return failure;
	          buffer = '';
	          state = PATH_START;
	          if (stateOverride) return;
	          continue;
	        } else {
	          if (char == '[') seenBracket = true;else if (char == ']') seenBracket = false;
	          buffer += char;
	        }

	        break;

	      case PORT:
	        if (DIGIT.test(char)) {
	          buffer += char;
	        } else if (char == EOF || char == '/' || char == '?' || char == '#' || char == '\\' && isSpecial(url) || stateOverride) {
	          if (buffer != '') {
	            var port = parseInt(buffer, 10);
	            if (port > 0xFFFF) return INVALID_PORT;
	            url.port = isSpecial(url) && port === specialSchemes[url.scheme] ? null : port;
	            buffer = '';
	          }

	          if (stateOverride) return;
	          state = PATH_START;
	          continue;
	        } else return INVALID_PORT;

	        break;

	      case FILE:
	        url.scheme = 'file';
	        if (char == '/' || char == '\\') state = FILE_SLASH;else if (base && base.scheme == 'file') {
	          if (char == EOF) {
	            url.host = base.host;
	            url.path = base.path.slice();
	            url.query = base.query;
	          } else if (char == '?') {
	            url.host = base.host;
	            url.path = base.path.slice();
	            url.query = '';
	            state = QUERY;
	          } else if (char == '#') {
	            url.host = base.host;
	            url.path = base.path.slice();
	            url.query = base.query;
	            url.fragment = '';
	            state = FRAGMENT;
	          } else {
	            if (!startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
	              url.host = base.host;
	              url.path = base.path.slice();
	              shortenURLsPath(url);
	            }

	            state = PATH;
	            continue;
	          }
	        } else {
	          state = PATH;
	          continue;
	        }
	        break;

	      case FILE_SLASH:
	        if (char == '/' || char == '\\') {
	          state = FILE_HOST;
	          break;
	        }

	        if (base && base.scheme == 'file' && !startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
	          if (isWindowsDriveLetter(base.path[0], true)) url.path.push(base.path[0]);else url.host = base.host;
	        }

	        state = PATH;
	        continue;

	      case FILE_HOST:
	        if (char == EOF || char == '/' || char == '\\' || char == '?' || char == '#') {
	          if (!stateOverride && isWindowsDriveLetter(buffer)) {
	            state = PATH;
	          } else if (buffer == '') {
	            url.host = '';
	            if (stateOverride) return;
	            state = PATH_START;
	          } else {
	            failure = parseHost(url, buffer);
	            if (failure) return failure;
	            if (url.host == 'localhost') url.host = '';
	            if (stateOverride) return;
	            buffer = '';
	            state = PATH_START;
	          }

	          continue;
	        } else buffer += char;

	        break;

	      case PATH_START:
	        if (isSpecial(url)) {
	          state = PATH;
	          if (char != '/' && char != '\\') continue;
	        } else if (!stateOverride && char == '?') {
	          url.query = '';
	          state = QUERY;
	        } else if (!stateOverride && char == '#') {
	          url.fragment = '';
	          state = FRAGMENT;
	        } else if (char != EOF) {
	          state = PATH;
	          if (char != '/') continue;
	        }

	        break;

	      case PATH:
	        if (char == EOF || char == '/' || char == '\\' && isSpecial(url) || !stateOverride && (char == '?' || char == '#')) {
	          if (isDoubleDot(buffer)) {
	            shortenURLsPath(url);

	            if (char != '/' && !(char == '\\' && isSpecial(url))) {
	              url.path.push('');
	            }
	          } else if (isSingleDot(buffer)) {
	            if (char != '/' && !(char == '\\' && isSpecial(url))) {
	              url.path.push('');
	            }
	          } else {
	            if (url.scheme == 'file' && !url.path.length && isWindowsDriveLetter(buffer)) {
	              if (url.host) url.host = '';
	              buffer = buffer.charAt(0) + ':'; // normalize windows drive letter
	            }

	            url.path.push(buffer);
	          }

	          buffer = '';

	          if (url.scheme == 'file' && (char == EOF || char == '?' || char == '#')) {
	            while (url.path.length > 1 && url.path[0] === '') {
	              url.path.shift();
	            }
	          }

	          if (char == '?') {
	            url.query = '';
	            state = QUERY;
	          } else if (char == '#') {
	            url.fragment = '';
	            state = FRAGMENT;
	          }
	        } else {
	          buffer += percentEncode(char, pathPercentEncodeSet);
	        }

	        break;

	      case CANNOT_BE_A_BASE_URL_PATH:
	        if (char == '?') {
	          url.query = '';
	          state = QUERY;
	        } else if (char == '#') {
	          url.fragment = '';
	          state = FRAGMENT;
	        } else if (char != EOF) {
	          url.path[0] += percentEncode(char, C0ControlPercentEncodeSet);
	        }

	        break;

	      case QUERY:
	        if (!stateOverride && char == '#') {
	          url.fragment = '';
	          state = FRAGMENT;
	        } else if (char != EOF) {
	          if (char == "'" && isSpecial(url)) url.query += '%27';else if (char == '#') url.query += '%23';else url.query += percentEncode(char, C0ControlPercentEncodeSet);
	        }

	        break;

	      case FRAGMENT:
	        if (char != EOF) url.fragment += percentEncode(char, fragmentPercentEncodeSet);
	        break;
	    }

	    pointer++;
	  }
	}; // `URL` constructor
	// https://url.spec.whatwg.org/#url-class


	var URLConstructor = function URL(url
	/* , base */
	) {
	  var that = anInstance(this, URLConstructor, 'URL');
	  var base = arguments.length > 1 ? arguments[1] : undefined;
	  var urlString = String(url);
	  var state = setInternalState$6(that, {
	    type: 'URL'
	  });
	  var baseState, failure;

	  if (base !== undefined) {
	    if (base instanceof URLConstructor) baseState = getInternalURLState(base);else {
	      failure = parseURL(baseState = {}, String(base));
	      if (failure) throw TypeError(failure);
	    }
	  }

	  failure = parseURL(state, urlString, null, baseState);
	  if (failure) throw TypeError(failure);
	  var searchParams = state.searchParams = new URLSearchParams$1();
	  var searchParamsState = getInternalSearchParamsState(searchParams);
	  searchParamsState.updateSearchParams(state.query);

	  searchParamsState.updateURL = function () {
	    state.query = String(searchParams) || null;
	  };

	  if (!descriptors) {
	    that.href = serializeURL.call(that);
	    that.origin = getOrigin.call(that);
	    that.protocol = getProtocol.call(that);
	    that.username = getUsername.call(that);
	    that.password = getPassword.call(that);
	    that.host = getHost.call(that);
	    that.hostname = getHostname.call(that);
	    that.port = getPort.call(that);
	    that.pathname = getPathname.call(that);
	    that.search = getSearch.call(that);
	    that.searchParams = getSearchParams.call(that);
	    that.hash = getHash.call(that);
	  }
	};

	var URLPrototype = URLConstructor.prototype;

	var serializeURL = function () {
	  var url = getInternalURLState(this);
	  var scheme = url.scheme;
	  var username = url.username;
	  var password = url.password;
	  var host = url.host;
	  var port = url.port;
	  var path = url.path;
	  var query = url.query;
	  var fragment = url.fragment;
	  var output = scheme + ':';

	  if (host !== null) {
	    output += '//';

	    if (includesCredentials(url)) {
	      output += username + (password ? ':' + password : '') + '@';
	    }

	    output += serializeHost(host);
	    if (port !== null) output += ':' + port;
	  } else if (scheme == 'file') output += '//';

	  output += url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
	  if (query !== null) output += '?' + query;
	  if (fragment !== null) output += '#' + fragment;
	  return output;
	};

	var getOrigin = function () {
	  var url = getInternalURLState(this);
	  var scheme = url.scheme;
	  var port = url.port;
	  if (scheme == 'blob') try {
	    return new URL(scheme.path[0]).origin;
	  } catch (error) {
	    return 'null';
	  }
	  if (scheme == 'file' || !isSpecial(url)) return 'null';
	  return scheme + '://' + serializeHost(url.host) + (port !== null ? ':' + port : '');
	};

	var getProtocol = function () {
	  return getInternalURLState(this).scheme + ':';
	};

	var getUsername = function () {
	  return getInternalURLState(this).username;
	};

	var getPassword = function () {
	  return getInternalURLState(this).password;
	};

	var getHost = function () {
	  var url = getInternalURLState(this);
	  var host = url.host;
	  var port = url.port;
	  return host === null ? '' : port === null ? serializeHost(host) : serializeHost(host) + ':' + port;
	};

	var getHostname = function () {
	  var host = getInternalURLState(this).host;
	  return host === null ? '' : serializeHost(host);
	};

	var getPort = function () {
	  var port = getInternalURLState(this).port;
	  return port === null ? '' : String(port);
	};

	var getPathname = function () {
	  var url = getInternalURLState(this);
	  var path = url.path;
	  return url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
	};

	var getSearch = function () {
	  var query = getInternalURLState(this).query;
	  return query ? '?' + query : '';
	};

	var getSearchParams = function () {
	  return getInternalURLState(this).searchParams;
	};

	var getHash = function () {
	  var fragment = getInternalURLState(this).fragment;
	  return fragment ? '#' + fragment : '';
	};

	var accessorDescriptor = function (getter, setter) {
	  return {
	    get: getter,
	    set: setter,
	    configurable: true,
	    enumerable: true
	  };
	};

	if (descriptors) {
	  objectDefineProperties(URLPrototype, {
	    // `URL.prototype.href` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-href
	    href: accessorDescriptor(serializeURL, function (href) {
	      var url = getInternalURLState(this);
	      var urlString = String(href);
	      var failure = parseURL(url, urlString);
	      if (failure) throw TypeError(failure);
	      getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
	    }),
	    // `URL.prototype.origin` getter
	    // https://url.spec.whatwg.org/#dom-url-origin
	    origin: accessorDescriptor(getOrigin),
	    // `URL.prototype.protocol` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-protocol
	    protocol: accessorDescriptor(getProtocol, function (protocol) {
	      var url = getInternalURLState(this);
	      parseURL(url, String(protocol) + ':', SCHEME_START);
	    }),
	    // `URL.prototype.username` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-username
	    username: accessorDescriptor(getUsername, function (username) {
	      var url = getInternalURLState(this);
	      var codePoints = arrayFrom(String(username));
	      if (cannotHaveUsernamePasswordPort(url)) return;
	      url.username = '';

	      for (var i = 0; i < codePoints.length; i++) {
	        url.username += percentEncode(codePoints[i], userinfoPercentEncodeSet);
	      }
	    }),
	    // `URL.prototype.password` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-password
	    password: accessorDescriptor(getPassword, function (password) {
	      var url = getInternalURLState(this);
	      var codePoints = arrayFrom(String(password));
	      if (cannotHaveUsernamePasswordPort(url)) return;
	      url.password = '';

	      for (var i = 0; i < codePoints.length; i++) {
	        url.password += percentEncode(codePoints[i], userinfoPercentEncodeSet);
	      }
	    }),
	    // `URL.prototype.host` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-host
	    host: accessorDescriptor(getHost, function (host) {
	      var url = getInternalURLState(this);
	      if (url.cannotBeABaseURL) return;
	      parseURL(url, String(host), HOST);
	    }),
	    // `URL.prototype.hostname` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-hostname
	    hostname: accessorDescriptor(getHostname, function (hostname) {
	      var url = getInternalURLState(this);
	      if (url.cannotBeABaseURL) return;
	      parseURL(url, String(hostname), HOSTNAME);
	    }),
	    // `URL.prototype.port` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-port
	    port: accessorDescriptor(getPort, function (port) {
	      var url = getInternalURLState(this);
	      if (cannotHaveUsernamePasswordPort(url)) return;
	      port = String(port);
	      if (port == '') url.port = null;else parseURL(url, port, PORT);
	    }),
	    // `URL.prototype.pathname` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-pathname
	    pathname: accessorDescriptor(getPathname, function (pathname) {
	      var url = getInternalURLState(this);
	      if (url.cannotBeABaseURL) return;
	      url.path = [];
	      parseURL(url, pathname + '', PATH_START);
	    }),
	    // `URL.prototype.search` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-search
	    search: accessorDescriptor(getSearch, function (search) {
	      var url = getInternalURLState(this);
	      search = String(search);

	      if (search == '') {
	        url.query = null;
	      } else {
	        if ('?' == search.charAt(0)) search = search.slice(1);
	        url.query = '';
	        parseURL(url, search, QUERY);
	      }

	      getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
	    }),
	    // `URL.prototype.searchParams` getter
	    // https://url.spec.whatwg.org/#dom-url-searchparams
	    searchParams: accessorDescriptor(getSearchParams),
	    // `URL.prototype.hash` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-hash
	    hash: accessorDescriptor(getHash, function (hash) {
	      var url = getInternalURLState(this);
	      hash = String(hash);

	      if (hash == '') {
	        url.fragment = null;
	        return;
	      }

	      if ('#' == hash.charAt(0)) hash = hash.slice(1);
	      url.fragment = '';
	      parseURL(url, hash, FRAGMENT);
	    })
	  });
	} // `URL.prototype.toJSON` method
	// https://url.spec.whatwg.org/#dom-url-tojson


	redefine(URLPrototype, 'toJSON', function toJSON() {
	  return serializeURL.call(this);
	}, {
	  enumerable: true
	}); // `URL.prototype.toString` method
	// https://url.spec.whatwg.org/#URL-stringification-behavior

	redefine(URLPrototype, 'toString', function toString() {
	  return serializeURL.call(this);
	}, {
	  enumerable: true
	});

	if (NativeURL) {
	  var nativeCreateObjectURL = NativeURL.createObjectURL;
	  var nativeRevokeObjectURL = NativeURL.revokeObjectURL; // `URL.createObjectURL` method
	  // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
	  // eslint-disable-next-line no-unused-vars

	  if (nativeCreateObjectURL) redefine(URLConstructor, 'createObjectURL', function createObjectURL(blob) {
	    return nativeCreateObjectURL.apply(NativeURL, arguments);
	  }); // `URL.revokeObjectURL` method
	  // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
	  // eslint-disable-next-line no-unused-vars

	  if (nativeRevokeObjectURL) redefine(URLConstructor, 'revokeObjectURL', function revokeObjectURL(url) {
	    return nativeRevokeObjectURL.apply(NativeURL, arguments);
	  });
	}

	setToStringTag(URLConstructor, 'URL');
	_export({
	  global: true,
	  forced: !nativeUrl,
	  sham: !descriptors
	}, {
	  URL: URLConstructor
	});

	// https://url.spec.whatwg.org/#dom-url-tojson


	_export({
	  target: 'URL',
	  proto: true,
	  enumerable: true
	}, {
	  toJSON: function toJSON() {
	    return URL.prototype.toString.call(this);
	  }
	});

	var SessionController = function SessionController(_ref) {
	  var browser = _ref.browser,
	      $urlModal = _ref.$urlModal,
	      $saveButton = _ref.$saveButton,
	      $saveModal = _ref.$saveModal,
	      uberFileLoader = _ref.uberFileLoader;

	  _classCallCheck(this, SessionController);

	  var urlConfig = {
	    dataTitle: 'Load Session',
	    $widgetParent: $urlModal.find('.modal-body'),
	    mode: 'url',
	    dataOnly: true
	  };
	  this.urlWidget = new FileLoadWidget(urlConfig, new FileLoadManager());
	  configureModal(this.urlWidget, $urlModal, function (fileLoadManager) {
	    uberFileLoader.ingestPaths(fileLoadManager.getPaths());
	    return true;
	  });
	  configureSaveModal(browser, $saveModal);
	  $saveButton.on('click', function (e) {
	    $saveModal.modal();
	  });
	};

	function configureSaveModal(browser, $modal) {
	  var input_default_value = 'igv-app-session.json';
	  var $input = $modal.find('input');
	  $modal.on('show.bs.modal', function (e) {
	    $input.val(input_default_value);
	  });
	  $modal.on('hidden.bs.modal', function (e) {
	    $input.val(input_default_value);
	  });

	  var okHandler = function okHandler() {
	    var filename = $input.val();
	    var extensions = new Set(['json', 'xml']);

	    if (undefined === filename || '' === filename) {
	      filename = $input.attr('placeholder');
	    } else if (false === extensions.has(getExtension(filename))) {
	      filename = filename + '.json';
	    } // dismiss modal


	    $modal.modal('hide'); // Pretty JSON output

	    var obj = browser.toJSON();
	    var json = JSON.stringify(obj, null, '\t');
	    var data = URL.createObjectURL(new Blob([json], {
	      type: "application/octet-stream"
	    }));
	    igv.download(filename, data);
	  }; // ok - button


	  var $ok = $modal.find('.modal-footer button:nth-child(2)');
	  $ok.on('click', okHandler);
	  $input.on('keyup', function (e) {
	    if (13 === e.keyCode) {
	      okHandler();
	    }
	  }); // upper dismiss - x - button

	  var $dismiss = $modal.find('.modal-header button:nth-child(1)');
	  $dismiss.on('click', function () {
	    $modal.modal('hide');
	  }); // lower dismiss - close - button

	  $dismiss = $modal.find('.modal-footer button:nth-child(1)');
	  $dismiss.on('click', function () {
	    $modal.modal('hide');
	  });
	}

	var SVGController = function SVGController(_ref) {
	  var browser = _ref.browser,
	      $saveModal = _ref.$saveModal;

	  _classCallCheck(this, SVGController);

	  configureSaveModal$1(browser, $saveModal);
	};

	function configureSaveModal$1(browser, $modal) {
	  var input_default_value = 'igv-app.svg';
	  var $input = $modal.find('input');
	  $modal.on('show.bs.modal', function (e) {
	    $input.val(input_default_value);
	  });
	  $modal.on('hidden.bs.modal', function (e) {
	    $input.val(input_default_value);
	  });

	  var okHandler = function okHandler() {
	    var fn = $input.val();
	    var extensions = new Set(['svg']);

	    if (undefined === fn || '' === fn) {
	      fn = $input.attr('placeholder');
	    } else if (false === extensions.has(getExtension(fn))) {
	      fn = fn + '.svg';
	    } // dismiss modal


	    $modal.modal('hide');
	    browser.renderSVG({
	      filename: fn
	    });
	  }; // ok - button


	  var $ok = $modal.find('.modal-footer button:nth-child(2)');
	  $ok.on('click', okHandler);
	  $input.on('keyup', function (e) {
	    if (13 === e.keyCode) {
	      okHandler();
	    }
	  }); // upper dismiss - x - button

	  var $dismiss = $modal.find('.modal-header button:nth-child(1)');
	  $dismiss.on('click', function () {
	    $modal.modal('hide');
	  }); // lower dismiss - close - button

	  $dismiss = $modal.find('.modal-footer button:nth-child(1)');
	  $dismiss.on('click', function () {
	    $modal.modal('hide');
	  });
	}

	var namespace = '.igv-webapp-drag';
	var dragData;

	var makeDraggable = function makeDraggable(targetElement, handleElement) {
	  $(handleElement).on('mousedown' + namespace, dragStart.bind(targetElement));
	};

	function dragStart(event) {
	  event.stopPropagation(); // event.preventDefault();

	  var styleX = Math.round(parseFloat(this.style.left.replace("px", "")));
	  var styleY = Math.round(parseFloat(this.style.top.replace("px", "")));
	  var dragFunction = drag.bind(this);
	  var dragEndFunction = dragEnd.bind(this);
	  dragData = {
	    dragFunction: dragFunction,
	    dragEndFunction: dragEndFunction,
	    dx: styleX - event.screenX,
	    dy: styleY - event.screenY
	  };
	  $(document).on('mousemove' + namespace, dragFunction);
	  $(document).on('mouseup' + namespace, dragEndFunction);
	  $(document).on('mouseleave' + namespace, dragEndFunction);
	  $(document).on('mouseexit' + namespace, dragEndFunction);
	}

	function drag(event) {
	  if (!dragData) {
	    return;
	  }

	  event.stopPropagation();
	  var styleX = dragData.dx + event.screenX;
	  var styleY = dragData.dy + event.screenY;
	  this.style.left = styleX + "px";
	  this.style.top = styleY + "px";
	}

	function dragEnd(event) {
	  if (!dragData) {
	    return;
	  }

	  event.stopPropagation();
	  var styleX = dragData.dx + event.screenX;
	  var styleY = dragData.dy + event.screenY;
	  this.style.left = styleX + "px";
	  this.style.top = styleY + "px";
	  $(document).off(namespace);
	  dragData = undefined;
	  var id = $(this).attr('id');
	}

	var Panel = /*#__PURE__*/function () {
	  function Panel(_ref) {
	    var _this = this;

	    var $container = _ref.$container,
	        panel = _ref.panel,
	        isHidden = _ref.isHidden,
	        xFunction = _ref.xFunction,
	        yFunction = _ref.yFunction;

	    _classCallCheck(this, Panel);

	    this.container = $container.get(0);
	    this.$panel = $(panel);
	    var $drag_handle = this.$panel.find('.igv-webapp-panel-drag-container');
	    makeDraggable(panel, $drag_handle.get(0));
	    var str = "resize.panel-".concat(igv.guid(), ".igv-web-app");
	    $(window).on(str, function () {
	      if (false === _this.isHidden) {
	        _this.layout(xFunction, yFunction);
	      }
	    });
	    var $closer = this.$panel.find('i.fa-times-circle');
	    $closer.on("click.igv-webapp.panel-".concat(igv.guid()), function (event) {
	      event.stopPropagation();

	      _this.dismissPanel();
	    });
	    this.xFunction = xFunction;
	    this.yFunction = yFunction;

	    if (true === isHidden) {
	      this.dismissPanel();
	    } else {
	      this.presentPanel();
	    }
	  }

	  _createClass(Panel, [{
	    key: "presentPanel",
	    value: function presentPanel() {
	      this.layout(this.xFunction, this.yFunction);
	      this.isHidden = false;
	    }
	  }, {
	    key: "dismissPanel",
	    value: function dismissPanel() {
	      this.moveOffScreen();
	      this.isHidden = true;
	    }
	  }, {
	    key: "layout",
	    value: function layout(xFunction, yFunction) {
	      var _this$container$getBo = this.container.getBoundingClientRect(),
	          width_container = _this$container$getBo.width,
	          height_container = _this$container$getBo.height;

	      var _this$$panel$get$getB = this.$panel.get(0).getBoundingClientRect(),
	          width_panel = _this$$panel$get$getB.width,
	          height_panel = _this$$panel$get$getB.height;

	      var left = xFunction(width_container, width_panel);
	      var top = yFunction(height_container, height_panel);
	      this.$panel.offset({
	        left: left,
	        top: top
	      });
	    }
	  }, {
	    key: "moveOffScreen",
	    value: function moveOffScreen() {
	      this.$panel.offset({
	        left: -1000,
	        top: -1000
	      });
	    }
	  }]);

	  return Panel;
	}();

	var AlertPanel = /*#__PURE__*/function (_Panel) {
	  _inherits(AlertPanel, _Panel);

	  var _super = _createSuper(AlertPanel);

	  function AlertPanel(_ref) {
	    var _this;

	    var $container = _ref.$container,
	        panel = _ref.panel,
	        isHidden = _ref.isHidden;

	    _classCallCheck(this, AlertPanel);

	    var xFunction = function xFunction(cw, w) {
	      return (cw - w) / 2;
	    };

	    var yFunction = function yFunction(ch, h) {
	      // return (ch - h) / 2;
	      return 64;
	    };

	    _this = _super.call(this, {
	      $container: $container,
	      panel: panel,
	      isHidden: isHidden,
	      xFunction: xFunction,
	      yFunction: yFunction
	    });
	    _this.messageContainer = _this.$panel.find('#igv-webapp-alert-panel-content-container');
	    return _this;
	  }

	  _createClass(AlertPanel, [{
	    key: "presentAlert",
	    value: function presentAlert(message) {
	      this.messageContainer.text(message);

	      _get(_getPrototypeOf(AlertPanel.prototype), "presentPanel", this).call(this);
	    }
	  }]);

	  return AlertPanel;
	}(Panel);

	var alertPanelConfigurator = function alertPanelConfigurator(_ref2) {
	  var $container = _ref2.$container;
	  return {
	    $container: $container,
	    panel: $('#igv-webapp-alertpanel').get(0),
	    isHidden: true
	  };
	};

	var trackLoadController;
	var multipleFileGenomeController;
	var multipleFileSessionController;
	var genomeLoadController;
	var sessionController;
	var svgController;
	var shareController;
	var googleEnabled = false;
	var alertPanel;

	var main = function main($container, config) {
	  // const alertDialog = new igv.AlertDialog($container)
	  // alertDialog.$container[0].style.top = '300px';
	  // if (config.clientId && 'CLIENT_ID' !== config.clientId && (window.location.protocol !== "https:" && window.location.host !== "localhost")) {
	  //     const secureUrl = window.location.href.replace("http:", "https:")
	  //     console.warn("To enable Google Drive use https://");
	  //     alertDialog.present(`Google services are disabled.  To enable Google use <a href="${secureUrl}">${secureUrl}</a>`);
	  // }
	  var enableGoogle = config.clientId && 'CLIENT_ID' !== config.clientId && (window.location.protocol === "https:" || window.location.host === "localhost");

	  if (enableGoogle) {
	    var browser;
	    var gapiConfig = {
	      callback: function callback() {
	        _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
	          var ignore;
	          return regeneratorRuntime.wrap(function _callee$(_context) {
	            while (1) {
	              switch (_context.prev = _context.next) {
	                case 0:
	                  _context.next = 2;
	                  return init(config.clientId);

	                case 2:
	                  ignore = _context.sent;
	                  _context.next = 5;
	                  return igv.createBrowser($container.get(0), config.igvConfig);

	                case 5:
	                  browser = _context.sent;
	                  //  global hack -- there is only 1 browser in this app
	                  Globals.browser = browser;
	                  googleEnabled = true;
	                  postInit();
	                  initializationHelper(browser, $container, config);

	                case 10:
	                case "end":
	                  return _context.stop();
	              }
	            }
	          }, _callee);
	        }))();
	      },
	      onerror: function onerror(error) {
	        console.error(error);
	        initializationHelper(browser, $container, config);
	      }
	    };
	    gapi.load('client:auth2', gapiConfig);
	  } else {
	    _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
	      var browser;
	      return regeneratorRuntime.wrap(function _callee2$(_context2) {
	        while (1) {
	          switch (_context2.prev = _context2.next) {
	            case 0:
	              _context2.next = 2;
	              return igv.createBrowser($container.get(0), config.igvConfig);

	            case 2:
	              browser = _context2.sent;
	              Globals.browser = browser;
	              initializationHelper(browser, $container, config);

	            case 5:
	            case "end":
	              return _context2.stop();
	          }
	        }
	      }, _callee2);
	    }))();
	  }
	};

	var initializationHelper = function initializationHelper(browser, $container, options) {
	  alertPanel = new AlertPanel(alertPanelConfigurator({
	    $container: $container
	  }));
	  createAppBookmarkHandler($('#igv-app-bookmark-button'));
	  var $multipleFileLoadModal = $('#igv-app-multiple-file-load-modal');
	  var $igv_app_dropdown_google_drive_track_file_button = $('#igv-app-dropdown-google-drive-track-file-button');

	  if (!googleEnabled) {
	    $igv_app_dropdown_google_drive_track_file_button.parent().hide();
	  } // const multipleFileTrackConfig =
	  //     {
	  //         $modal: $multipleFileLoadModal,
	  //         modalTitle: 'Track File Error',
	  //         $localFileInput: $('#igv-app-dropdown-local-track-file-input'),
	  //         $dropboxButton: $('#igv-app-dropdown-dropbox-track-file-button'),
	  //         $googleDriveButton: googleEnabled ? $igv_app_dropdown_google_drive_track_file_button : undefined,
	  //         configurationHandler: MultipleFileLoadController.trackConfigurator,
	  //         jsonFileValidator: MultipleFileLoadController.trackJSONValidator,
	  //         pathValidator: MultipleFileLoadController.trackPathValidator,
	  //         fileLoadHandler: (configurations) => {
	  //             browser.loadTrackList( configurations );
	  //         }
	  //     };
	  // multipleFileTrackController = new MultipleFileLoadController(browser, multipleFileTrackConfig);
	  //
	  // // Track load controller configuration
	  // const trackLoadConfig =
	  //     {
	  //         trackRegistryFile: options.trackRegistryFile,
	  //         $urlModal: $('#igv-app-track-from-url-modal'),
	  //         $encodeModal: $('#igv-app-encode-modal'),
	  //         $dropdownMenu: $('#igv-app-track-dropdown-menu'),
	  //         $genericTrackSelectModal: $('#igv-app-generic-track-select-modal'),
	  //         uberFileLoader: multipleFileTrackController
	  //     };
	  //
	  // trackLoadController = new TrackLoadController(browser, trackLoadConfig);


	  var $googleDriveButton = googleEnabled ? $igv_app_dropdown_google_drive_track_file_button : undefined;
	  trackLoadController = new TrackLoadController(trackLoadControllerConfigurator({
	    browser: browser,
	    trackRegistryFile: options.trackRegistryFile,
	    $googleDriveButton: $googleDriveButton
	  }));
	  var $igv_app_dropdown_google_drive_genome_file_button = $('#igv-app-dropdown-google-drive-genome-file-button');

	  if (!googleEnabled) {
	    $igv_app_dropdown_google_drive_genome_file_button.parent().hide();
	  }

	  var multipleFileGenomeConfig = {
	    $modal: $multipleFileLoadModal,
	    modalTitle: 'Genome File Error',
	    $localFileInput: $('#igv-app-dropdown-local-genome-file-input'),
	    $dropboxButton: $('#igv-app-dropdown-dropbox-genome-file-button'),
	    $googleDriveButton: googleEnabled ? $igv_app_dropdown_google_drive_genome_file_button : undefined,
	    configurationHandler: MultipleFileLoadController.genomeConfigurator,
	    jsonFileValidator: MultipleFileLoadController.genomeJSONValidator,
	    pathValidator: MultipleFileLoadController.genomePathValidator,
	    fileLoadHandler: function fileLoadHandler(configurations) {
	      var config = configurations[0];
	      loadGenome(config);
	    }
	  };
	  multipleFileGenomeController = new MultipleFileLoadController(browser, multipleFileGenomeConfig); // Genome Load Controller

	  var genomeLoadConfig = {
	    $urlModal: $('#igv-app-genome-from-url-modal'),
	    genomes: options.genomes,
	    uberFileLoader: multipleFileGenomeController
	  };
	  genomeLoadController = new GenomeLoadController(browser, genomeLoadConfig);
	  var genomeDictionary = undefined;

	  _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
	    return regeneratorRuntime.wrap(function _callee3$(_context3) {
	      while (1) {
	        switch (_context3.prev = _context3.next) {
	          case 0:
	            _context3.prev = 0;
	            _context3.next = 3;
	            return genomeLoadController.getAppLaunchGenomes();

	          case 3:
	            genomeDictionary = _context3.sent;
	            _context3.next = 9;
	            break;

	          case 6:
	            _context3.prev = 6;
	            _context3.t0 = _context3["catch"](0);
	            alertPanel.presentAlert(_context3.t0.message);

	          case 9:
	            if (genomeDictionary) {
	              genomeDropdownLayout({
	                browser: browser,
	                genomeDictionary: genomeDictionary,
	                $dropdown_menu: $('#igv-app-genome-dropdown-menu')
	              });
	            }

	          case 10:
	          case "end":
	            return _context3.stop();
	        }
	      }
	    }, _callee3, null, [[0, 6]]);
	  }))();

	  var $igv_app_dropdown_google_drive_session_file_button = $('#igv-app-dropdown-google-drive-session-file-button');

	  if (!googleEnabled) {
	    $igv_app_dropdown_google_drive_session_file_button.parent().hide();
	  } // Multiple File Session Controller


	  var multipleFileSessionConfig = {
	    $modal: $multipleFileLoadModal,
	    modalTitle: 'Session File Error',
	    $localFileInput: $('#igv-app-dropdown-local-session-file-input'),
	    multipleFileSelection: false,
	    $dropboxButton: $('#igv-app-dropdown-dropbox-session-file-button'),
	    $googleDriveButton: googleEnabled ? $igv_app_dropdown_google_drive_session_file_button : undefined,
	    configurationHandler: MultipleFileLoadController.sessionConfigurator,
	    jsonFileValidator: MultipleFileLoadController.sessionJSONValidator
	  };
	  multipleFileSessionController = new MultipleFileLoadController(browser, multipleFileSessionConfig); // Session Controller

	  var sessionConfig = {
	    browser: browser,
	    $urlModal: $('#igv-app-session-from-url-modal'),
	    $saveButton: $('#igv-app-save-session-button'),
	    $saveModal: $('#igv-app-session-save-modal'),
	    uberFileLoader: multipleFileSessionController
	  };
	  sessionController = new SessionController(sessionConfig); // SVG Controller

	  var svgConfig = {
	    browser: browser,
	    $saveModal: $('#igv-app-svg-save-modal')
	  };
	  svgController = new SVGController(svgConfig); // URL Shortener Configuration

	  var $igv_app_tweet_button_container = $('#igv-app-tweet-button-container');
	  var urlShortenerFn;

	  if (options.urlShortener) {
	    urlShortenerFn = setURLShortener(options.urlShortener) !== undefined;
	  }

	  if (!urlShortenerFn) {
	    $igv_app_tweet_button_container.hide();
	  }

	  var shareConfig = {
	    $modal: $('#igv-app-share-modal'),
	    $share_input: $('#igv-app-share-input'),
	    $copy_link_button: $('#igv-app-copy-link-button'),
	    $tweet_button_container: urlShortenerFn ? $igv_app_tweet_button_container : undefined,
	    $email_button: $('#igv-app-email-button'),
	    $qrcode_button: $('#igv-app-qrcode-button'),
	    $qrcode_image: $('#igv-app-qrcode-image'),
	    $embed_container: $('#igv-app-embed-container'),
	    $embed_button: $('#igv-app-embed-button'),
	    embedTarget: options.embedTarget
	  };
	  shareController = new ShareController($container, browser, shareConfig);
	};

	var createAppBookmarkHandler = function createAppBookmarkHandler($bookmark_button) {
	  $bookmark_button.on('click', function (e) {
	    var blurb, str;
	    window.history.pushState({}, "IGV", sessionURL());
	    str = /Mac/i.test(navigator.userAgent) ? 'Cmd' : 'Ctrl';
	    blurb = 'A bookmark URL has been created. Press ' + str + '+D to save.';
	    alert(blurb);
	  });
	};

	/*
	 *  The MIT License (MIT)
	 *
	 * Copyright (c) 2016-2017 The Regents of the University of California
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
	 * associated documentation files (the "Software"), to deal in the Software without restriction, including
	 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
	 * following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in all copies or substantial
	 * portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
	 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND
	 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
	 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 *
	 */
	//import igv from "http://localhost/igv-web/dist/igv.esm.js";

	$(document).ready(function () {
	  // window.igv = igv;
	  main($('#igv-app-container'), igvwebConfig);
	});

})));
