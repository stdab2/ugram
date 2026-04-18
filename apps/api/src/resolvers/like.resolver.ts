import { authenticateUser } from "../../Validators/validateUser.js";
import {
	validateLikePostId,
	validateLikePostExists,
	validatePostNotAlreadyLiked,
	validateLikeExists,
} from "../../Validators/validateLikes.js";
import { UserContext } from "../types/userContext.types.js";
import { prisma } from "../lib/prisma.js";
import { createNotification, deleteLikeNotification } from "../services/notification.service.js";

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

			return prisma.$transaction(async (tx) => {
				await tx.like.create({
					data: {
						userId: context.user!.id,
						postId,
					},
				});

				const post = await tx.post.findUnique({
					where: { id: postId },
					select: { id: true, authorId: true },
				});

				if (!post) {
					throw new Error("Post not found.");
				}

				await deleteLikeNotification({
					tx,
					recipientId: post.authorId,
					actorId: context.user!.id,
					postId: post.id,
				});

				await createNotification({
					tx,
					type: "LIKE",
					recipientId: post.authorId,
					actorId: context.user!.id,
					postId: post.id,
				});

				const updatedPost = await tx.post.findUnique({
					where: { id: postId },
				});

				if (!updatedPost) {
					throw new Error("Post not found.");
				}

				return updatedPost;
			});
		},

		unlikePost: async (_: unknown, { postId }: { postId: number }, context: UserContext) => {
			authenticateUser(context.user);
			validateLikePostId(postId);
			await validateLikePostExists(postId);
			await validateLikeExists(postId, context.user!.id);

			return prisma.$transaction(async (tx) => {
				const post = await tx.post.findUnique({
					where: { id: postId },
					select: { id: true, authorId: true },
				});

				if (!post) {
					throw new Error("Post not found.");
				}

				await tx.like.delete({
					where: {
						userId_postId: {
							userId: context.user!.id,
							postId,
						},
					},
				});

				await deleteLikeNotification({
					tx,
					recipientId: post.authorId,
					actorId: context.user!.id,
					postId: post.id,
				});

				const updatedPost = await tx.post.findUnique({
					where: { id: postId },
				});

				if (!updatedPost) {
					throw new Error("Post not found.");
				}

				return updatedPost;
			});
		},
	},
};
