// resolverMap.ts
import { IResolvers } from 'graphql-tools';
const resolverMap: IResolvers = {
    Query: {
        hello: (obj, args, context, info) => {
          // log some of the auth related info added to the context
          // console.debug(context.kauth.isAuthenticated())
          // console.debug(context.kauth)

          let name = 'world'

          if (context.kauth.accessToken) {
            name = context.kauth.accessToken.content.preferred_username
          }

          return `Hello ${name}`;
        }
    }
};
export default resolverMap;