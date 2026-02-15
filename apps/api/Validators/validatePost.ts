import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { BadRequestError, NotFoundError } from "./errors.js";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
	adapter,
});

export const validatePostId = (id: number): void => {
	if (!id || id <= 0) {
		throw new BadRequestError("Invalid post ID");
	}
};

export const validatePostExists = async (id: number): Promise<void> => {
	const post = await prisma.post.findUnique({
		where: { id },
	});
	if (!post) {
		throw new NotFoundError(`Post with ID ${id} not found`);
	}
};
