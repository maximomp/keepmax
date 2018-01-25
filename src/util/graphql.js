/**
 * GraphQL related helpers and additional types.
 */

const assert = require("assert");
const {GraphQLScalarType} = require("graphql");
const {GraphQLError} = require("graphql/error");
const {Kind} = require("graphql/language");

const dh = require("./data");

exports.Date = new GraphQLScalarType({
  name: "Date",

  /**
   * Serialize date value into string
   * @param  {Date} value date value
   * @return {String} date as string
   */
  serialize: function (value) {
    assert(dh.isInstance(Date, value), "`value` should be a valid date");
    assert(!isNaN(value.getTime()), "`value shuld be a valid date");
    return value.toJSON();
  },

  /**
   * Parse value into date
   * @param  {string} value serialized date value
   * @return {Date} date value
   */
  parseValue: function (value) {
    const date = new Date(value);
    assert(!isNaN(date.getTime()), "`value shuld be a valid date");
    return date;
  },

  /**
   * Parse ast literal to date
   * @param  {Object} ast graphql ast
   * @return {Date} date value
   */
  parseLiteral: function (ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError("Query error: Can only parse strings to dates but got a: " + ast.kind, [ast]);
    }

    const result = new Date(ast.value);

    if (isNaN(result.getTime())) {
      throw new GraphQLError("Query error: Invalid date", [ast]);
    }

    if (ast.value !== result.toJSON()) {
      throw new GraphQLError("Query error: Invalid date format, only accepts: YYYY-MM-DDTHH:MM:SS.SSSZ", [ast]);
    }

    return result;
  }
});

function parseLiteral(ast) {
  switch (ast.kind) {
  case Kind.STRING:
  case Kind.BOOLEAN:
    return ast.value;
  case Kind.INT:
  case Kind.FLOAT:
    return parseFloat(ast.value);
  case Kind.OBJECT: {
    const value = Object.create(null);
    ast.fields.forEach((field) => {
      value[field.name.value] = parseLiteral(field.value);
    });

    return value;
  }
  case Kind.LIST:
    return ast.values.map(parseLiteral);
  default:
    return null;
  }
}

exports.DynamicObject = new GraphQLScalarType({
  name: "DynamicObject",
  description: "A dynamic object.",
  serialize(v) {
    return v;
  },
  parseValue(v) {
    return v;
  },
  parseLiteral(ast) {
    return parseLiteral(ast);
  }
});

// --- Batching

class Batcher {
  constructor(batchFn, opts=null) {
    assert(dh.isFunction(batchFn), "`batchFn` should be a function");

    this._batchFn = batchFn;
    this._options = opts;
    this._queue = [];
  }

  run(key) {
    assert(dh.isDefined(key), "`key` should be a valid value");

    return new Promise((resolve, reject) => {
      this._queue.push({key, resolve, reject});


      if (this._queue.length === 1) {
        enqueue(() => {
          return dispatch(this);
        });
      }
    });
  }
}

// Private
let resolvedPromise = null;

function enqueue(callback) {
  if (!resolvedPromise) {
    resolvedPromise = Promise.resolve();
  }

  resolvedPromise.then(function() {
    return process.nextTick(callback);
  });
}

function dispatch(loader) {
  const queue = loader._queue;
  loader._queue = [];

  // If a maxBatchSize was provided and the queue is longer, then segment the
  // queue into multiple batches, otherwise treat the queue as a single batch.
  const maxBatchSize = loader._options && loader._options.maxBatchSize;

  if (maxBatchSize && maxBatchSize > 0 && maxBatchSize < queue.length) {
    for (let i = 0; i < queue.length / maxBatchSize; i++) {
      dispatchBatch(loader, queue.slice(i * maxBatchSize, (i + 1) * maxBatchSize));
    }
  } else {
    dispatchBatch(loader, queue);
  }
}

function dispatchBatch(loader, queue) {
  // Collect all keys to be loaded in this dispatch
  const keys = new Set(queue.map(function (_ref) {
    const key = _ref.key;
    return key;
  }));

  const batchResult = loader._batchFn(keys);
  if (! dh.isPromise(batchResult)) {
    throw TypeError("The batch function should be a function that accepts " +
                    "Array<key> and return Promise<Map<key,value>>");
  }

  batchResult.then(function(result) {
    if (!(dh.isMap(result) || dh.isPlainObject(result))) {
      throw TypeError("The batch function should return Promise<Map<key,value>>");
    }

    for(let item of queue) {
      const value = result[item.key];
      if (dh.isInstance(Error, value)) {
        item.reject(value);
      } else {
        item.resolve(value);
      }
    }
  }).catch(function(error) {
    for(let item of queue) {
      item.reject(error);
    }
  });
}

exports.batch = function(getter, options={}) {
  assert(dh.isFunction(getter), "`getter` should be a function");

  if (options.maxBatchSize === undefined) {
    options.maxBatchSize = 128;
  }

  const batcher = new Batcher(getter, options);
  return (key) => batcher.run(key);
};
