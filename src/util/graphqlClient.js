/**
 * A GraphQL client.
 *
 * This will be moved to inditex-back-common once finished the
 * development.
 **/

const assert = require("assert");

const http = require("./httpClient");
const json = require("./json");
const dh = require("./data");
const kerberos = require("./kerberos")

class GraphqlClient {
  /* kerberosPrincipal attribute determines if the graphql calls should be
     authenticated with a kerberos token associated to that principal 
  */
  constructor(kerberosPrincipal=null) {
    this.kerberosPrincipal = kerberosPrincipal;
  }

  async query(url, text, variables=null) {
    assert(dh.isString(url), "`url` parameter is required");
    assert(dh.isString(text), "`text` parameter is required");

    const headers = {
      "content-type": "application/json"
    }

    if (this.kerberosPrincipal) {
      try {
        const ticket = await kerberos.getTicket(this.kerberosPrincipal);
        headers["Authorization"] = "Negotiate " + ticket;
      } catch (err) {
        throw new Error("Invalid authentication token");
      }
    }

    const body = json.encode({
      query: text,
      variables: variables
    });

    return http.post(url, body, {headers}).then((res) => {
      const mime = res.headers["content-type"] || "";
      if (mime.indexOf("application/json") !== -1) {
        return json.decode(res.body);
      } else {
        throw new Error("unexpected response");
      }
    });
  }

}

exports.GraphqlClient = GraphqlClient;
