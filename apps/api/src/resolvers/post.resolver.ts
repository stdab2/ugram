import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
	adapter,
});

export const postResolvers = {
  Query: {
    post: async (_: any, args: { id: number }) => {
      return prisma.post.findUnique({
        where: { id: args.id },
      });
    },
    posts: async () => {
      return prisma.post.findMany();
    },
  },
  Mutation: {},
};
