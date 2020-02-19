// index.ts
// Apollo Server
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import depthLimit from 'graphql-depth-limit';
import { createServer } from 'http';
import compression from 'compression';
import cors from 'cors';
import schema from './schema';
const { configureKeycloak } = require('./lib/common')
const { KeycloakContext } = require('keycloak-connect-graphql')

const graphqlPath = '/graphql';
const port = 3000;

const app = express();
const { keycloak } = new configureKeycloak(app, graphqlPath);
// Ensure entire GraphQL Api can only be accessed by authenticated users
app.use(graphqlPath, keycloak.protect())

const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(7)],
  context: ({req }) => {
    return {
      kauth: new KeycloakContext({ req })
    }
  }
});

app.use('*', cors());
app.use(compression());


server.applyMiddleware({ app, path: graphqlPath });
const httpServer = createServer(app);
httpServer.listen(
  { port: 3000 },
  (): void => console.log(`\n🚀      GraphQL is now running on http://localhost:${port}${graphqlPath}`));