import * as Sentry from "@sentry/node";
import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import {
	validateUserId,
	validateUsersExist,
	validateNonEmptyString,
} from "../../Validators/validateUser.js";
import { saveUploadedImage, deleteImageFromStorage } from "../services/image.service.js";
import type { FileUpload } from "graphql-upload";
import { Post } from "../../generated/prisma/client.js";
import { handlePrismaError } from "../../Validators/errors.js";
import {
	validatePostId,
	validatePostCreationOwnership,
	validatePostOwnership,
	validatePostExists,
} from "../../Validators/validatePost.js";
import { authenticateUser } from "../../Validators/validateUser.js";
import { UserContext } from "../types/userContext.types.js";
import { getDatabaseUrl } from "../database-url.js";
import { Prisma } from "../../generated/prisma/client.js";

const adapter = new PrismaPg({
	connectionString: getDatabaseUrl(),
});

const prisma = new PrismaClient({
	adapter,
});

type PostWithCount = Prisma.PostGetPayload<{
	include: {
		_count: {
			select: { messages: true };
		};
	};
}>;

type CreatePostArgs = {
	data: {
		description: string;
		image: Promise<FileUpload>;
		authorId: number;
		hashtags?: string[];
		mentionedUsers?: number[];
	};
};

export const postResolvers = {
	Query: {
		post: async (_: unknown, args: { id: number }, context: UserContext) => {
			authenticateUser(context.user);
			validatePostId(args.id);
			return prisma.post.findUnique({
				where: { id: args.id },
				include: {
					_count: {
						select: { messages: true },
					},
				},
			});
		},
		posts: async (_: unknown, args: { limit?: number; offset?: number }, context: UserContext) => {
			authenticateUser(context.user);
			const limit = Math.min(Math.max(args.limit ?? 20, 0), 100);
			const offset = Math.max(args.offset ?? 0, 0);
			return prisma.post.findMany({
				take: limit,
				skip: offset,
				include: {
					_count: {
						select: { messages: true },
					},
				},
			});
		},
		postsByAuthor: async (
			_: unknown,
			args: { authorId: number; limit?: number; offset?: number },
			context: UserContext
		) => {
			authenticateUser(context.user);
			validateUserId(args.authorId);
			const limit = Math.min(Math.max(args.limit ?? 20, 0), 100);
			const offset = Math.max(args.offset ?? 0, 0);
			return prisma.post.findMany({
				where: { authorId: args.authorId },
				take: limit,
				skip: offset,
				include: {
					_count: {
						select: { messages: true },
					},
				},
			});
		},
	},
	Post: {
		author: async (parent: Post, _: unknown, context: UserContext) => {
			authenticateUser(context.user);
			return prisma.userUgram.findUnique({
				where: { id: parent.authorId },
			});
		},

		messageCount: (parent: PostWithCount) => {
			if (!parent._count) {
				console.warn("messageCount called without _count in parent", {
					postId: parent.id,
				});
			}
			return parent._count?.messages ?? 0;
		},
		likeCount: async (parent: Post, _: unknown, context: UserContext) => {
			authenticateUser(context.user);

			return prisma.like.count({
				where: { postId: parent.id },
			});
		},

		isLikedByCurrentUser: async (parent: Post, _: unknown, context: UserContext) => {
			authenticateUser(context.user);

			const like = await prisma.like.findUnique({
				where: {
					userId_postId: {
						userId: context.user!.id,
						postId: parent.id,
					},
				},
			});

			return !!like;
		},
	},
	Mutation: {
		createPost: async (_: unknown, { data }: CreatePostArgs, context: UserContext) => {
			authenticateUser(context.user);
			const { description, image, authorId, hashtags, mentionedUsers } = data;
			validateUserId(authorId);
			validatePostCreationOwnership(authorId, context.user);
			validateNonEmptyString(description, "Post description");

			if (mentionedUsers && mentionedUsers.length > 0) {
				await validateUsersExist(mentionedUsers);
			}

			if (!image) {
				throw new Error("Image upload is required.");
			}

			const { imageKey } = await saveUploadedImage(image, "post");
			let hashtagRows: { id: number }[] = [];

			if (hashtags?.length) {
				const tags = Array.from(
					new Set(
						hashtags.map((t: string) => t.toLowerCase().trim()).filter((t: string) => t.length > 0)
					)
				);
				if (tags.length) {
					await prisma.hashtag.createMany({
						data: tags.map((name: string) => ({ name })),
						skipDuplicates: true,
					});
				}

				hashtagRows = tags.length
					? await prisma.hashtag.findMany({
							where: { name: { in: tags } },
							select: { id: true },
						})
					: [];
			}

			try {
				const post = await prisma.post.create({
					data: {
						description,
						authorId,
						hashtags: {
							connect: hashtagRows.map((h) => ({ id: h.id })),
						},
						mentionedUsers: {
							connect: mentionedUsers ? mentionedUsers.map((id: number) => ({ id })) : [],
						},
						imageKey,
					},
					include: {
						hashtags: true,
						mentionedUsers: true,
						author: true,
					},
				});

				if (process.env.NODE_ENV !== "production") {
					setTimeout(async () => {
						await prisma.post.update({
							where: { id: post.id },
							data: {
								imageStatus: "UPLOADED",
								imageUrl: `uploads/post/${imageKey}.webp`,
								thumbnailUrl: `uploads/post/${imageKey}_thumb.webp`,
							},
						});
					}, 10000);
				}

				return post;
			} catch (error: unknown) {
				handlePrismaError(error, "Post");
			}
		},
		deletePost: async (_: unknown, args: { id: number }, context: UserContext) => {
			authenticateUser(context.user);
			validatePostId(args.id);
			await validatePostExists(args.id);
			await validatePostOwnership(args.id, context.user);
			try {
				const deletedPost = await prisma.post.delete({
					where: { id: args.id },
				});

				try {
					await deleteImageFromStorage(deletedPost.imageUrl);
				} catch (cleanupError) {
					const error =
						cleanupError instanceof Error ? cleanupError : new Error(String(cleanupError));

					Sentry.withScope((scope) => {
						scope.setTag("resolver", "deletePost");
						scope.setContext("cleanup", {
							postId: deletedPost.id,
							imageUrl: deletedPost.imageUrl,
						});

						Sentry.captureException(error);
					});

					console.warn("Post deleted but image cleanup failed", {
						postId: deletedPost.id,
						imageUrl: deletedPost.imageUrl,
						error,
					});
				}

				return deletedPost;
			} catch (error: unknown) {
				handlePrismaError(error, "Post");
			}
		},
		updatePost: async (
			_: unknown,
			args: { id: number; description: string },
			context: UserContext
		) => {
			authenticateUser(context.user);
			validatePostId(args.id);
			await validatePostExists(args.id);
			await validatePostOwnership(args.id, context.user);
			validateNonEmptyString(args.description, "Post description");

			try {
				const postHashtags = getPostHashtags(args.description);
				const postMentions = getPostMentions(args.description);
				const existingUsers = await prisma.userUgram.findMany({
					where: { userName: { in: postMentions } },
				});
				const existingUserPostMentions = existingUsers.map((existingUser) => existingUser.userName);

				return await prisma.post.update({
					where: { id: args.id },
					data: {
						description: args.description,
						hashtags: {
							set: [],
							connectOrCreate: postHashtags.map((name) => ({
								where: { name },
								create: { name },
							})),
						},
						mentionedUsers: {
							set: [],
							connect: existingUserPostMentions.map((userName) => ({ userName })),
						},
					},
				});
			} catch (error: unknown) {
				handlePrismaError(error, "Post");
			}
		},
	},
};

function getPostHashtags(description: string): string[] {
	return description.match(/#\w+/g) || [];
}

function getPostMentions(description: string): string[] {
	return description.match(/@\w+/g)?.map((mention) => mention.slice(1)) || [];
}
