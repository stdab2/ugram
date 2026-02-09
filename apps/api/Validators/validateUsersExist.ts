import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { GraphQLError } from 'graphql';

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
	adapter,
});

export async function validateUsersExist(userIds: number[]) {
  const users = await prisma.userUgram.findMany({
    where: { id: { in: userIds } },
    select: { id: true },
  });

  if (users.length !== userIds.length) {
    throw new GraphQLError("One or more users do not exist", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
}
