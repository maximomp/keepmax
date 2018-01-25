const Koa = require("koa");
const Router = require("koa-router");

const log = require("../../util/logging");
const routes = require("./routes");


exports.initialize = function() {
  const app = new Koa();
  const router = new Router();

  routes.setup(router);

  app.use(router.routes());
  app.use(router.allowedMethods());

  log.info(`now listening on http://localhost:3000`);
  app.listen(3000);
};
