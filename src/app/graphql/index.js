const g = require("graphql");

const Query = require("./types");
const giql  = require("./graphiql");


const Schema = new g.GraphQLSchema({
  query: Query,
  // mutation: MutationOA
});

exports.exec = function(query, props, context={}) {
  return g.graphql(Schema, query, null, context, props);
};


exports.dumpGraphiQL = function(options) {
  return giql.renderGraphiQL(options);
};
