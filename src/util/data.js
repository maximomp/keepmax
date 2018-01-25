/**
 * Collection of predicates and data transformation functions.
 */

const Promise = require("bluebird");
const assert = require("assert");
const lsh = require("lodash");
const XRegExp = require("xregexp");


const camelcaseKeys = require("camelcase-keys");

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const idStringRegex = /^[0-9]+$/;

exports.isUuidString = function(v) {
  return uuidRegex.test(v);
};

exports.isIdString = function(v) {
  return idStringRegex.test(v);
};

exports.isNaN = function(v) {
  return lsh.isNaN(v);
};

exports.isFunction = function(v) {
  return typeof(v) === "function";
};

exports.isSymbol = function(v) {
  return typeof v === "symbol";
};

exports.isString = function(v) {
  return (typeof v === "string" || exports.isInstance(String, v));
};

exports.isBoolean = function(v) {
  return typeof v === "boolean";
};

exports.isNumber = function(v) {
  return Number.isFinite(v);
};

exports.isInteger = function(v) {
  return Number.isInteger(v);
};

exports.isArray = function(v) {
  return lsh.isArray(v);
};

exports.isEmpty = function(value) {
  if (exports.isString(value)) {
    return s.length === 0;
  } else {
    return lsh.isEmpty(coll);
  }
};

exports.isBlank = function(s) {
  const re = new XRegExp("^[\\s\\p{Z}]+$");
  return (exports.isEmpty(s) || re.test(s));
};

exports.isStartsWith = function(s, prefix) {
  return (s.lastIndexOf(prefix, 0) === 0);
};

exports.isNull = function(v) {
  return v === null;
};

exports.isMap = function(v) {
  return exports.isInstance(Map, v);
};

exports.isSet = function(v) {
  return exports.isInstance(Set, v);
};

exports.isUndefined = function(v) {
  return v === undefined;
};

exports.isDefined = function(v) {
  return (!exports.isNull(v)) && (!exports.isUndefined(v));
};

exports.isPromise = function(v) {
  return exports.isInstance(Promise, v) || exports.isFunction(v.then);
};

exports.isPlainObject = function(v) {
  return lsh.isPlainObject(v);
};

exports.isObject = function(v) {
  return v !== null && typeof v === "object";
};

exports.isOptionallyObject = function(v) {
  return v === null || v === undefined || typeof v === "object";
};

exports.isBuffer = function(v) {
  return Buffer.isBuffer(v);
};

exports.isInstance = function(clazz, val) {
  return val instanceof clazz;
};

exports.isContainedIn = function(value, coll) {
  const data = new Set(Array.from(coll));
  return data.has(value);
};

/**
 * Check if all elements on the provided collection
 * satisfies the predicate.
 *
 * @return {boolean}
 */
exports.every = function(predicate, list) {
  return list.reduce((acc, item) => {
    const result = predicate(item);
    if (result === true) {
      return acc;
    } else {
      return false;
    }
  }, true);
};

exports.identity = function(v) {
  return v;
};

/**
 * Return a function that constantly returns
 * the provided value.
 *
 * @param {?}
 * @return {function(...?): ?}
 */
exports.constantly = function(val) {
  return () => val;
};

exports.clone = function(obj) {
  return lsh.cloneDeep(obj);
};

exports.merge = function(...objects) {
  return lsh.merge({}, ...objects);
};

function deepMergeCustomizer(objValue, srcValue) {
  if (lsh.isPlainObject(objValue) && lsh.isPlainObject(srcValue)) {
    return lsh.merge(objValue, srcValue, deepMergeCustomizer);
  } else if (lsh.isArray(objValue) && lsh.isArray(srcValue)) {
    return objValue.concat(srcValue);
  } else {
    return undefined;
  }
}

exports.deepMerge = function(...objects) {
  if (objects.length === 0) {
    return null;
  }

  if (objects.length === 1) {
    return objects[0];
  }

  return lsh.mergeWith(...objects, deepMergeCustomizer);
};

exports.assign = function(...objects) {
  return lsh.assign(...objects);
};

exports.toPlainObject = function(obj) {
  return lsh.toPlainObject(obj);
};

exports.camelcaseKeys = function(obj) {
  assert(exports.isPlainObject(obj), "`obj` should be a plain object");
  return camelcaseKeys(obj, {deep: false});
};

exports.groupBy = function(keyfn, objects) {
  assert(exports.isFunction(keyfn), "`keyfn` should be a function");
  assert((exports.isArray(objects) || exports.isSet(objects)), "`objects` should be array");

  return lsh.groupBy(objects, keyfn);
};

exports.indexBy = function(keyfn, objects) {
  assert(exports.isFunction(keyfn), "`keyfn` should be a function");
  assert((exports.isArray(objects) || exports.isSet(objects)), "`objects` should be array");

  return lsh.reduce(objects, (result, value) => {
    result[keyfn(value)] = value;
    return result;
  }, {});
};

exports.partial = function(...params) {
  return lsh.partial(...params);
};

exports.repeat = function(...params) {
  return Array.from(lsh.repeat(...params));
};

exports.find = function(pred, items) {
  const result = items.filter(pred);
  if (result.length > 0) {
    return result[0];
  } else {
    return null;
  }
};

exports.selectKeys = function(obj, keys) {
  return lsh.pick(obj, keys);
};

exports.memoize = function(...args) {
  return lsh.memoize(...args);
};

exports.extendSet = function(set, iterable) {
  assert(exports.isSet(set), "`set` should be a Set instance");

  for (let item of iterable) {
    set.add(item);
  }
  return set;
};

exports.zip = function(...args) {
  return lsh.zip(...args);
};

exports.slice = function(...args) {
  return lsh.slice(...args);
};

exports.drop = function(n, coll) {
  return lsh.drop(coll, n);
};

exports.take = function(n, coll) {
  return lsh.take(coll, n);
};

exports.sortBy = function(fnOrFns, coll) {
  if (!exports.isArray(fnOrFns)) {
    fnOrFns = [fnOrFns];
  }
  return lsh.sortBy(coll, fnOrFns);
};
