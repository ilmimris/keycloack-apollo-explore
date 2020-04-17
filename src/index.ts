// index.ts
// Apollo Server
const express = require('express')
const { ApolloServer, gql, defaultPlaygroundOptions } = require('apollo-server-express')
import expressPlayground from 'graphql-playground-middleware-express'
const { configureKeycloak } = require('./lib/common')

const {
  KeycloakContext,
  KeycloakTypeDefs,
  KeycloakSchemaDirectives
} = require('keycloak-connect-graphql')

const app = express()

const graphqlPath = '/graphql'

// perform the standard keycloak-connect middleware setup on our app
const { keycloak } = configureKeycloak(app, graphqlPath)

// app.use(graphqlPath, function(req:any, res:any)  {
//   console.log(req);
// })
// Ensure entire GraphQL Api can only be accessed by authenticated users
app.use(graphqlPath, keycloak.protect())


const typeDefs = gql`
  type Query {
    hello: String @hasRole(role: "user")
  }
`

const resolvers = {
  Query: {
    hello: (obj:any, args:any, context:any, info:any) => {
      // log some of the auth related info added to the context
      console.log(context.kauth.isAuthenticated())
      console.log(context.kauth.accessToken.content.preferred_username)

      const name = context.kauth.accessToken.content.preferred_username || 'world'
      return `Hello ${name}`
    }
  }
}

const server = new ApolloServer({
  typeDefs: [KeycloakTypeDefs, typeDefs],
  schemaDirectives: KeycloakSchemaDirectives,
  resolvers,
  playground: false,
  // {
  //   tabs: [
  //     {
  //       endpoint: "/graphql",
  //       query: "{hello}",
  //       headers: {  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJiM2M3NDRmOC1hNGUwLTQ4MDAtYjE4Yy1hNGY2ODcxYjFhNjAifQ.eyJqdGkiOiJmNzUxMzA3ZS0wOGQyLTQ5MGEtODcyYS04MDkxOTllNWVjOGYiLCJleHAiOjAsIm5iZiI6MCwiaWF0IjoxNTgyMTEwNDUxLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvYXV0aC9yZWFsbXMvZXhwbG9yZSIsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9hdXRoL3JlYWxtcy9leHBsb3JlIiwidHlwIjoiUmVnaXN0cmF0aW9uQWNjZXNzVG9rZW4iLCJyZWdpc3RyYXRpb25fYXV0aCI6ImF1dGhlbnRpY2F0ZWQifQ.fLSwWxMxmgp4GE_yYMz_mJXPh0Cw6l706etMvqgMUCk"}
  //     },
  //   ],

  // },
  context: ({ req }: any) => {
    // console.log({ req })
    return {
      kauth: new KeycloakContext({ req })
    }
  }
})

app.get(graphqlPath, (req:any, res:any, next:any) => {
    const headers = JSON.stringify({
      'X-CSRF-Token': req.kauth.grant.access_token.token,
    });
  expressPlayground({
    ...defaultPlaygroundOptions,
    endpoint: `${graphqlPath}?headers=${encodeURIComponent(headers)}`,
    settings: {
      ...defaultPlaygroundOptions.settings,
      'request.credentials': 'same-origin',
    },
    version: "",
  })(req, res, next);
});


server.applyMiddleware({ app })

const port = 3000

app.listen({ port }, () =>
  console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`)
)