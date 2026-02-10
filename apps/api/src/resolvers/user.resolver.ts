import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
	adapter,
});

interface CreateUserArgs {
	userName: string;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phoneNumber: string;
	picture?: string;
}

export const userResolvers = {
	Query: {
		user: async (_: unknown, args: { id: number }) => {
			return prisma.userUgram.findUnique({
				where: { id: args.id },
			});
		},
		userByUserName: async (_: unknown, args: { userName: string }) => {
			return prisma.userUgram.findUnique({
				where: { userName: args.userName },
			});
		},
		users: async () => {
			return prisma.userUgram.findMany();
		},
	},
	Mutation: {
		createUser: async (_: unknown, args: CreateUserArgs) => {
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
