import { userResolvers } from "./user.resolver.js";
import { postResolvers } from "./post.resolver.js";
import { hashtagResolvers } from "./hashtag.resolver.js";
import { searchResolvers } from "./search.resolver.js";
import { autocompleteResolvers } from "./autocomplete.resolver.js";
import { likesResolvers } from "./like.resolver.js";
import { DateTimeScalar, scalars } from "./scalars.js";
import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";

export const resolvers = {
	...scalars,
	DateTime: DateTimeScalar,
	Upload: GraphQLUpload,

	Query: {
		...userResolvers.Query,
		...postResolvers.Query,
		...hashtagResolvers.Query,
		...searchResolvers.Query,
		...autocompleteResolvers.Query,
		...likesResolvers.Query,
	},

	Mutation: {
		...userResolvers.Mutation,
		...postResolvers.Mutation,
		...hashtagResolvers.Mutation,
		...likesResolvers.Mutation,
	},

	Post: {
		...postResolvers.Post,
	},

	UserUgram: {
		...userResolvers.UserUgram,
	},
};
