
function handleRoot(ctx) {
  ctx.body = "Hello world from router";
}

function handleSaludador(ctx) {
  ctx.body = `Hola ${ctx.params.name}`;
}

exports.setup = function(router) {
  router.get("/", handleRoot);
  router.get("/saluda/:name", handleSaludador);
};
