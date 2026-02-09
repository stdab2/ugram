import { userResolvers } from "./user.resolver.js";
import { postResolvers } from "./post.resolver.js";
import { hashtagResolvers } from "./hashtag.resolver.js";
import { DateTimeScalar, scalars } from "./scalars.js";
import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";

export const resolvers = {
	...scalars,
	DateTime: DateTimeScalar,
	Upload: GraphQLUpload,

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
