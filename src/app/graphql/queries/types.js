const g = require("graphql");
const dh = require("../../../util/data");
const db = require("../../storage/db");

const Author = new g.GraphQLObjectType({
  name: "Author",
  fields: () => ({
    id: {type: new g.GraphQLNonNull(g.GraphQLID)},
    name: {type: new g.GraphQLNonNull(g.GraphQLString)},
  })
});

const Note = new g.GraphQLObjectType({
  name: "Note",
  fields: () => ({
    id: {type: new g.GraphQLNonNull(g.GraphQLID)},
    title: {type: new g.GraphQLNonNull(g.GraphQLString)},
    content: {type: new g.GraphQLNonNull(g.GraphQLString)},
    author: {
      type: new g.GraphQLNonNull(Author),
      resolve(src) {
        const authorId = src.authorId;

        const author = dh.find((item) => {
          return item.id === authorId;
        }, db.authors);

        return author;
      }
    },
  })
});

module.exports = {Note, Author};


