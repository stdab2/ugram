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
		hashtags: async () => {
			return prisma.hashtag.findMany();
		},
		popularHashtags: async (_: unknown, args: { limit?: number }) => {
			const limit = args.limit || 5;
			const hashtags = await prisma.hashtag.findMany({
				include: {
					_count: {
						select: { posts: true },
					},
				},
				orderBy: {
					posts: {
						_count: 'desc',
					},
				},
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
