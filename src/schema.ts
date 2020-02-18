// schema.ts
import 'graphql-import-node';
import * as typeDefs from './schema/schema.graphql';
import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './resolverMap';
import { GraphQLSchema } from 'graphql';
const { KeycloakTypeDefs, KeycloakSchemaDirectives } = require('keycloak-connect-graphql')

const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs: [KeycloakTypeDefs, typeDefs],
  schemaDirectives: KeycloakSchemaDirectives,
  resolvers,
});

export default schema;