import { PrismaClient } from "../generated/prisma/client.js";
import { GraphQLError } from "graphql";

export async function validateUsersExist(userIds: number[], prisma: PrismaClient) {
	const uniqueUserIds = Array.from(new Set(userIds));
	const users = await prisma.userUgram.findMany({
		where: { id: { in: uniqueUserIds } },
		select: { id: true },
	});

	const foundIds = new Set(users.map((user: { id: number }) => user.id));
	const missingUserIds = uniqueUserIds.filter((id) => !foundIds.has(id));

	if (missingUserIds.length > 0) {
		throw new GraphQLError("One or more users do not exist", {
			extensions: {
				code: "BAD_USER_INPUT",
				missingUserIds,
			},
		});
	}
}
