import { PrismaClient } from "../../generated/prisma/client.js";
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
    users: async () => {
      return prisma.userUgram.findMany();
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
    updateUser: async (_: any, args: any) => {
      const { id, ...updateData } = args;
      
      const data = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );
      
      return prisma.userUgram.update({
        where: { id },
        data,
      });
    },
  },
};
