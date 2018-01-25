const Koa = require("koa");
const Router = require("koa-router");
const raw = require("raw-body");
const inflate = require("inflation");

const log =  require("../../util/logging");
const json = require("../../util/json");

const routes = require("./routes");

const validContentTypes = ["application/json"];

async function bodyReadMiddleware(ctx, next) {
  const options = {
    limit: "5mb",
    encoding: "utf8"
  };

  const stream = inflate(ctx.req);
  const body = await raw(stream, options);

  ctx.request.body = body;

  return await next();
};

async function conditionalBodyDecoding(ctx, next) {
  const contentType = ctx.is(...validContentTypes);

  switch(contentType) {
  case "application/json": {
    ctx.data = json.decode(ctx.request.body);
    break;
  }
  default: {
    ctx.data = null;
  }}

  return await next();
};


exports.initialize = function() {
  const app = new Koa();
  const router = new Router();

  app.use(bodyReadMiddleware);
  app.use(conditionalBodyDecoding);

  routes.setup(router);

  app.use(router.routes());
  app.use(router.allowedMethods());

  log.info(`now listening on http://localhost:3000`);
  app.listen(3000);
};
