// resolverMap.ts
import { IResolvers } from 'graphql-tools';
const resolverMap: IResolvers = {
    Query: {
        hello: (obj, args, context, info) => {
          // log some of the auth related info added to the context
          console.log(context.kauth.isAuthenticated())
          console.log(context.kauth)
    
          if (context.kauth.accessToken) {
            const name = context.kauth.accessToken.content.preferred_username || 'world'
            return `Hello ${name}`
          }

          return '';
        }
    }
};
export default resolverMap;