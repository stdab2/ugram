import { PrismaClient, UserUgram } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
	adapter,
});

export const userResolvers = {
  Query: {
    user: async (_: any, args: { id: number }) => {
      return prisma.userUgram.findUnique({
        where: { id: args.id },
      });
    },
    users: async (_: any, args: { limit?: number; offset?: number }) => {
      return prisma.userUgram.findMany({
        take: args.limit,
        skip: args.offset,
      });
    },
  },
  UserUgram: {
    posts: async (parent: UserUgram) => {
      return prisma.post.findMany({
        where: { authorId: parent.id },
      });
    },
  },
  Mutation: {
    createUser: async (_: any, args: any) => {
      return prisma.userUgram.create({
        data: {
          userName: args.userName,
          email: args.email,
          password: args.password,
          firstName: args.firstName,
          lastName: args.lastName,
          phoneNumber: args.phoneNumber,
          picture: args.picture,
        },
      });
    },
  },
};
