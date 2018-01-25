const gql = require("../graphql");

function handleGraphiql(ctx) {
  const query = ctx.query.query;
  const props = ctx.query.variables;

  ctx.body = gql.dumpGraphiQL({
    endpoint: "/api/graphql",
    query: query,
    variables: props
  });
}

async function handleGraphql(ctx) {
  const query = ctx.data.query || "";
  const props = ctx.data.variables || {};

  ctx.body = await gql.exec(query, props);
}

exports.setup = function(router) {
  router.post("/api/graphql", handleGraphql);
  router.get("/debug/graphiql", handleGraphiql);
};
