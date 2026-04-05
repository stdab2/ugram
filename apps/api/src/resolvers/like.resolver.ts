import { authenticateUser } from "../../Validators/validateUser.js";
import {
	validateLikePostId,
	validateLikePostExists,
	validatePostNotAlreadyLiked,
	validateLikeExists,
} from "../../Validators/validateLikes.js";
import { UserContext } from "../types/userContext.types.js";
import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { getDatabaseUrl } from "../database-url.js";

const adapter = new PrismaPg({
	connectionString: getDatabaseUrl(),
});

const prisma = new PrismaClient({
	adapter,
});

export const likesResolvers = {
	Query: {
		isPostLiked: async (_: unknown, { postId }: { postId: number }, context: UserContext) => {
			authenticateUser(context.user);
			validateLikePostId(postId);
			await validateLikePostExists(postId);

			const like = await prisma.like.findUnique({
				where: {
					userId_postId: {
						userId: context.user!.id,
						postId,
					},
				},
			});

			return !!like;
		},
	},

	Mutation: {
		likePost: async (_: unknown, { postId }: { postId: number }, context: UserContext) => {
			authenticateUser(context.user);
			validateLikePostId(postId);
			await validateLikePostExists(postId);
			await validatePostNotAlreadyLiked(postId, context.user!.id);

			await prisma.like.create({
				data: {
					userId: context.user!.id,
					postId,
				},
			});

			const post = await prisma.post.findUnique({
				where: { id: postId },
			});

			return post;
		},

		unlikePost: async (_: unknown, { postId }: { postId: number }, context: UserContext) => {
			authenticateUser(context.user);
			validateLikePostId(postId);
			await validateLikePostExists(postId);
			await validateLikeExists(postId, context.user!.id);

			await prisma.like.delete({
				where: {
					userId_postId: {
						userId: context.user!.id,
						postId,
					},
				},
			});

			const post = await prisma.post.findUnique({
				where: { id: postId },
			});

			return post;
		},
	},
};
