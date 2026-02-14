import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { validateUsersExist } from "../../Validators/validateUser.js";
import { saveUploadedImage } from "../../services/image.service.js";
import type { FileUpload } from "graphql-upload";
import { Post } from "../../generated/prisma/client.js";

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
		post: async (_: unknown, args: { id: number }) => {
			return prisma.post.findUnique({
				where: { id: args.id },
			});
		},
		posts: async (_: unknown, args: { limit?: number; offset?: number }) => {
			return prisma.post.findMany({
				take: args.limit,
				skip: args.offset,
			});
		},
		postsByAuthor: async (
			_: unknown,
			args: { authorId: number; limit?: number; offset?: number }
		) => {
			return prisma.post.findMany({
				where: { authorId: args.authorId },
				take: args.limit,
				skip: args.offset,
			});
		},
	},
	Post: {
		author: async (parent: Post) => {
			return prisma.userUgram.findUnique({
				where: { id: parent.authorId },
			});
		},
	},
	Mutation: {
		createPost: async (_: unknown, { data }: CreatePostArgs) => {
			const { description, image, authorId, hashtags, mentionedUsers } = data;

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
		},
		deletePost: async (_: unknown, args: { id: number }) => {
			try {
				return await prisma.post.delete({
					where: { id: args.id },
				});
			} catch (e: unknown) {
				const errorMessage = e instanceof Error ? e.message : "Unknown error";
				throw Error(`Could not delete post ${errorMessage}`);
			}
		},
		updatePost: async (_: unknown, args: { id: number; description: string }) => {
			try {
				const post = await prisma.post.findUnique({
					where: { id: args.id },
				});

				if (!post) {
					throw new Error(`Post with id ${args.id} not found`);
				}

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
			} catch (e: unknown) {
				const errorMessage = e instanceof Error ? e.message : "Unknown error";
				throw Error(`Could not update post ${errorMessage}`);
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
