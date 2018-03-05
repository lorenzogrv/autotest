
module.exports = callsite

/**
 * @function callsite: Get a CallSite object describing the place where this
 *                     function, or the function `from`, was called.
 *
 * @param from: The function from which the stack must start upon
 * @returns CallSite object (see below)
 *
 * NOTE: this function is adapted from the awesome npm module `stack-trace`
 *
 * CallSite API (see https://code.google.com/p/v8-wiki/wiki/JavaScriptStackTraceApi):
 *
 * - getThis: returns the value of this
 * - getTypeName: returns the type of this as a string. This is the name of the function stored in the constructor field of this, if available, otherwise the object's [[Class]] internal property.
 * - getFunction: returns the current function
 * - getFunctionName: returns the name of the current function, typically its name property. If a name property is not available an attempt will be made to try to infer a name from the function's context.
 * - getMethodName: returns the name of the property of this or one of its prototypes that holds the current function
 * - getFileName: if this function was defined in a script returns the name of the script
 * - getLineNumber: if this function was defined in a script returns the current line number
 * - getColumnNumber: if this function was defined in a script returns the current column number
 * - getEvalOrigin: if this function was created using a call to eval returns a CallSite object representing the location where eval was called
 * - isToplevel: is this a toplevel invocation, that is, is this the global object?
 * - isEval: does this call take place in code defined by a call to eval?
 * - isNative: is this call in native V8 code?
 * - isConstructor: is this a constructor call?
 */

function callsite (from) {
  var v8Handler = Error.prepareStackTrace
  Error.prepareStackTrace = (er, stack) => stack

  var dummy = {}
  Error.captureStackTrace(dummy, from || callsite)

  // accessing the stack property triggers `prepareStackTrace`
  var CallSite = dummy.stack[0]
  Error.prepareStackTrace = v8Handler

  return CallSite
}
