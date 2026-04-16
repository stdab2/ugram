import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { getDatabaseUrl } from "../database-url.js";

const adapter = new PrismaPg({
	connectionString: getDatabaseUrl(),
});

const prisma = new PrismaClient({
	adapter,
});

interface SearchArgs {
	query: string;
	usersLimit?: number;
	usersOffset?: number;
	postsLimit?: number;
	postsOffset?: number;
	hashtagsLimit?: number;
	hashtagsOffset?: number;
}

export const searchResolvers = {
	Query: {
		search: async (_: unknown, args: SearchArgs) => {
			// Validate and clamp pagination parameters
			const usersLimit = Math.min(Math.max(args.usersLimit ?? 20, 0), 100);
			const usersOffset = Math.max(args.usersOffset ?? 0, 0);
			const postsLimit = Math.min(Math.max(args.postsLimit ?? 20, 0), 100);
			const postsOffset = Math.max(args.postsOffset ?? 0, 0);
			const hashtagsLimit = Math.min(Math.max(args.hashtagsLimit ?? 20, 0), 100);
			const hashtagsOffset = Math.max(args.hashtagsOffset ?? 0, 0);

			const searchTerm = args.query.trim();

			if (!searchTerm) {
				return { users: [], posts: [], hashtags: [] };
			}

			// Normalize the search term: if user typed "cat", also match "#cat" in hashtags
			const hashtagSearchTerm = searchTerm.startsWith("#") ? searchTerm : `#${searchTerm}`;

			const users = await prisma.userUgram.findMany({
				where: {
					OR: [
						{ userName: { contains: searchTerm, mode: "insensitive" } },
						{ firstName: { contains: searchTerm, mode: "insensitive" } },
						{ lastName: { contains: searchTerm, mode: "insensitive" } },
					],
				},
				take: usersLimit,
				skip: usersOffset,
			});

			const posts = await prisma.post.findMany({
				where: {
					OR: [
						{ description: { contains: searchTerm, mode: "insensitive" } },
						{
							hashtags: {
								some: {
									name: { contains: hashtagSearchTerm, mode: "insensitive" },
								},
							},
						},
					],
				},
				include: {
					hashtags: true,
					mentionedUsers: true,
					author: true,
				},
				take: postsLimit,
				skip: postsOffset,
			});

			const hashtags = await prisma.hashtag.findMany({
				where: {
					name: { contains: searchTerm, mode: "insensitive" },
				},
				include: {
					_count: {
						select: { posts: true },
					},
				},
				take: hashtagsLimit,
				skip: hashtagsOffset,
				orderBy: {
					posts: {
						_count: "desc",
					},
				},
			});

			const hashtagsWithCount = hashtags.map((hashtag) => ({
				id: hashtag.id,
				name: hashtag.name,
				postCount: hashtag._count.posts,
			}));

			return { users, posts, hashtags: hashtagsWithCount };
		},
	},
};
