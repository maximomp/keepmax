const g = require("graphql");

const Note = new g.GraphQLObjectType({
  name: "Note",
  fields: () => ({
    id: {type: new g.GraphQLNonNull(g.GraphQLID)},
    title: {type: new g.GraphQLNonNull(g.GraphQLString)},
    content: {type: new g.GraphQLNonNull(g.GraphQLString)},
  })
});


const Query = new g.GraphQLObjectType({
  name: "RootQuery",
  fields: () => ({
    notes: {
      type: new g.GraphQLList(Note),
      resolve(src, params) {
        return [];
      }
    }
  })
});


module.exports = Query;
