const g = require("graphql");

const dh = require("../../../util/data");
const db = require("../../storage/db");
const types = require("./types");

function resolveNotes(src, params) {
  return db.notes;
}

function resolveNote(src, params) {
  const note = dh.find((item) => {
    return item.id === params.id;
  }, db.notes);

  return note;
}

module.exports = new g.GraphQLObjectType({
  name: "RootQuery",
  fields: () => ({
    notes: {
      type: new g.GraphQLList(types.Note),
      resolve: resolveNotes
    },
    note: {
      type: new g.GraphQLNonNull(types.Note),
      args: {
        id: {type: new g.GraphQLNonNull(g.GraphQLID)}
      },
      resolve: resolveNote
    }
  })
});
