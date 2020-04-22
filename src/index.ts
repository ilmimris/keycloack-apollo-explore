// index.ts
// Apollo Server
import express, { NextFunction } from 'express';
const { ApolloServer, gql, defaultPlaygroundOptions } = require('apollo-server-express')
import expressPlayground from 'graphql-playground-middleware-express'
const { KeycloakContext } = require('keycloak-connect-graphql')

const { configureKeycloak } = require('./lib/common')
import schema from './schema';


const app = express()
const graphqlPath = '/graphql'

// perform the standard keycloak-connect middleware setup on our app
const { keycloak } = configureKeycloak(app, graphqlPath)

// Ensure entire GraphQL Api can only be accessed by authenticated users
app.use(graphqlPath, keycloak.protect())

const server = new ApolloServer({
  schema: schema,
  playground: false,
  context: ({ req }: any) => {
    return {
      kauth: new KeycloakContext({ req })
    }
  }
})

app.get(graphqlPath, (req: any, res: any, next: NextFunction) => {
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
  console.log(`🚀 Server ready at http://localhost:${port}${graphqlPath}`)
)