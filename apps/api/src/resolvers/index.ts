import { userResolvers } from "./user.resolver.js";
import { postResolvers } from "./post.resolver.js";
import { hashtagResolvers } from "./hashtag.resolver.js";
import { DateTimeScalar } from "./scalars.js";

export const resolvers = {
  DateTime: DateTimeScalar,
  Query: {
    hello: () => "Hello from GraphQL!",
    ...userResolvers.Query,
    ...postResolvers.Query,
    ...hashtagResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...hashtagResolvers.Mutation,
  },
  Post: {
    ...postResolvers.Post,
  },
};
