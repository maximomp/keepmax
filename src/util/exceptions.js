/**
 * Exception Types & Helpers
 **/

const assert = require("assert");
const dh = require("./data");

class RuntimeError extends Error {
  constructor(message, context=null) {
    super(message);
    this.context = context;
  }
}

class DatabaseTimeout extends RuntimeError {
  constructor(message, cause=null) {
    super(message);
    this.cause = cause;
  }
}

class ExceptionInfo extends RuntimeError {
  constructor(options) {
    assert(dh.isString(options.type), "`type` should be string");
    assert(dh.isString(options.code), "`code` should be string");

    if (dh.isString(options.message)) {
      super(options.message);
    } else {
      super(`${options.type}/${options.code}`);
    }

    this.type = options.type;
    this.code = options.code;
    this.context = options.context || null;
  }

  toJSON() {
    return {
      type: this.type,
      code: this.code,
      context: this.context,
      message: this.message
    };
  }
}

exports.RuntimeError = RuntimeError;
exports.ExceptionInfo = ExceptionInfo;
exports.DatabaseTimeout = DatabaseTimeout;

exports.raise = function(options) {
  throw new ExceptionInfo(options);
};

exports.isError = function(o) {
  return dh.isInstance(Error, o);
};

exports.isExceptionInfo = function(o) {
  return dh.isInstance(ExceptionInfo, o);
};

// FIXME: rename to `isDatabaseTimeout`
exports.isDatabaseTimeoutError = function(o) {
  return dh.isInstance(DatabaseTimeout, o);
};
