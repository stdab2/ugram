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
import { validatePostId } from "../../Validators/validatePost.js";
import { authenticateUser } from "../../Validators/validateUser.js";
import { UserContext } from "../types/userContext.types.js";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
	adapter,
});

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
			});
		},
		posts: async (_: unknown, args: { limit?: number; offset?: number }, context: UserContext) => {
			authenticateUser(context.user);
			const limit = Math.min(Math.max(args.limit ?? 20, 0), 100);
			const offset = Math.max(args.offset ?? 0, 0);
			return prisma.post.findMany({
				take: limit,
				skip: offset,
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
	},
	Mutation: {
		createPost: async (_: unknown, { data }: CreatePostArgs, context: UserContext) => {
			authenticateUser(context.user);
			const { description, image, authorId, hashtags, mentionedUsers } = data;
			validateUserId(authorId);
			validateNonEmptyString(description, "Post description");

			if (mentionedUsers && mentionedUsers.length > 0) {
				await validateUsersExist(mentionedUsers);
			}

			if (!image) {
				throw new Error("Image upload is required.");
			}

			const imageUrl = await saveUploadedImage(image, "post");
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
						imageUrl,
						authorId,
						hashtags: {
							connect: hashtagRows.map((h) => ({ id: h.id })),
						},
						mentionedUsers: {
							connect: mentionedUsers ? mentionedUsers.map((id: number) => ({ id })) : [],
						},
					},
					include: {
						hashtags: true,
						mentionedUsers: true,
						author: true,
					},
				});

				return post;
			} catch (error: unknown) {
				handlePrismaError(error, "Post");
			}
		},
		deletePost: async (_: unknown, args: { id: number }, context: UserContext) => {
			authenticateUser(context.user);
			validatePostId(args.id);
			try {
				const deletedPost = await prisma.post.delete({
					where: { id: args.id },
				});

				try {
					await deleteImageFromStorage(deletedPost.imageUrl);
				} catch (cleanupError) {
					console.warn("Post deleted but image cleanup failed", {
						postId: deletedPost.id,
						imageUrl: deletedPost.imageUrl,
						error: cleanupError,
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
