const g = require("graphql");
const giql  = require("./graphiql");


const Schema = new g.GraphQLSchema({
  query: require("./queries"),
  // mutation: require("./mutations")
});

exports.exec = function(query, props, context={}) {
  return g.graphql(Schema, query, null, context, props);
};


exports.dumpGraphiQL = function(options) {
  return giql.renderGraphiQL(options);
};
