/**
 * A Http client.
 **/

const assert = require("assert");
const http = require("http");
const https = require("https");
const URL = require("url").URL;

const Promise = require("bluebird");
const FormData = require("form-data");

const dh = require("./data");


function request({method, headers={}, url, body=""}) {
  assert(dh.isString(method), "`method` option is required");
  assert(dh.isString(url), "`url` option is required");

  const uri = new URL(url);

  const opts = {
    hostname: uri.hostname,
    protocol: uri.protocol,
    method: method.toUpperCase(),
    timeout: 5000,
    headers: headers,
    path: `${uri.pathname}${uri.search}`
  };

  if (uri.port) {
    opts.port = parseInt(uri.port, 10);
  }

  if (uri.username && uri.password) {
    opts.auth = `${uri.username}:${uri.password}`;
  }

  const module = (uri.protocol==="http:") ? http : https;

  if (dh.isInstance(FormData, body)) {
    opts.headers = body.getHeaders();
  }

  // Avoid chunked transfer encoding by setting Content-Length in POST requests
  if (opts.method == "POST") {
    opts.headers['Content-Length'] = Buffer.byteLength(body)
  }

  return new Promise((resolve, reject) => {
    const req = module.request(opts);

    req.on("response", (res) => {
      const chunks = [];

      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        chunks.push(chunk);
      });

      res.on("end", () => {
        const response = {
          status: res.statusCode,
          headers: res.headers,
          body: chunks.join("")
        };
        resolve(response);
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (dh.isInstance(FormData, body)) {
      body.pipe(req);
    } else {
      if (body) req.write(body);
      req.end();
    }
  });
}

function get(uri, options={}) {
  return request(dh.merge(options, {url: uri, method: "get"}));
}

function post(uri, body=null, options={}) {
  return request(dh.merge(options, {url: uri, method: "post", body:body}));
}

module.exports = {request, get, post};
