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
    posts: async (_: any, args: { limit?: number; offset?: number }) => {
      return prisma.post.findMany({
        take: args.limit,
        skip: args.offset,
      });
    },
    postsByAuthor: async (_: any, args: { authorId: number; limit?: number; offset?: number }) => {
      return prisma.post.findMany({
        where: { authorId: args.authorId },
        take: args.limit,
        skip: args.offset,
      });
    },
  },
  Post: {
    author: async (parent: any) => {
      return prisma.userUgram.findUnique({
        where: { id: parent.authorId },
      });
    },
  },
  Mutation: {},
};
