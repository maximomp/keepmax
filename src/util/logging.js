/**
 * Application logging facilities.
 */

const debug = require("debug");

class Logger {
  constructor(ns) {
    this._ns = ns;
    this._raw = debug(ns);
    this._info = debug(`${ns}:info`);
    this._error = debug(`${ns}:error`);
    this._trace = debug(`${ns}:trace`);
  }

  log(message, ...args) {
    this._raw(message, ...args);
  }

  info(message, ...args) {
    this._info(message, ...args);
  }

  trace(message, ...args) {
    this._trace(message, ...args);
  }

  error(message, ...args) {
    this._error(message, ...args);
  }

  getLogger(ns) {
    return new Logger(`${this._ns}:${ns}`);
  }
}

module.exports = new Logger("app");
