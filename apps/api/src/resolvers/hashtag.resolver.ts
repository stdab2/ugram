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
	},
	Mutation: {},
};
