import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
	adapter,
});

export const hashtagResolvers = {
	Query: {
		hashtag: async (_: unknown, args: { id: number }) => {
			return prisma.hashtag.findUnique({
				where: { id: args.id },
			});
		},
		hashtags: async (_: unknown, args: { limit?: number; offset?: number }) => {
			const limit = Math.min(Math.max(args.limit ?? 10, 0), 100);
			const offset = Math.max(args.offset ?? 0, 0);
			const hashtags = await prisma.hashtag.findMany({
				include: {
					_count: {
						select: { posts: true },
					},
				},
				orderBy: {
					posts: {
						_count: "desc",
					},
				},
				skip: offset,
				take: limit,
			});

			return hashtags.map((hashtag) => ({
				id: hashtag.id,
				name: hashtag.name,
				postCount: hashtag._count.posts,
			}));
		},
	},
	Mutation: {},
};
