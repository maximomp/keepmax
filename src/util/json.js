const dh = require("./data");

/**
 * Serialize the provided value using json
 * serialization format.
 *
 * @param {?} value
 * @return {string}
 */
exports.encode = function(value, opts={}) {
  let space = undefined;

  if (opts.pretty === true) {
    space = dh.repeat(" ", 2).join("");
  } else if (dh.isNumber(opts.pretty)) {
    space = dh.repeat(" ", opts.pretty).join("");
  }

  return JSON.stringify(value, opts.replacer, space);
};

/**
 * Deserialize the provided value using json
 * serialization format.
 *
 * @param {string} value
 * @return {?}
 */
exports.decode = function(value) {
  return JSON.parse(value);
};
