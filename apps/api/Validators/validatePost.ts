/**
 * Post input validators
 * Centralized validation logic for post operations
 */

import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { BadRequestError, NotFoundError } from "./errors.js";
import { getDatabaseUrl } from "../src/database-url.js";

const adapter = new PrismaPg({
	connectionString: getDatabaseUrl(),
});

const prisma = new PrismaClient({
	adapter,
});

/**
 * Validate post ID
 * @param id - Post ID to validate
 * @throws {BadRequestError} If invalid
 */
export const validatePostId = (id: number): void => {
	if (!id || id <= 0) {
		throw new BadRequestError("Invalid post ID");
	}
};

/**
 * Validate post exists in database
 * @param id - Post ID to check
 * @throws {NotFoundError} If post not found
 */
export const validatePostExists = async (id: number): Promise<void> => {
	const post = await prisma.post.findUnique({
		where: { id },
	});
	if (!post) {
		throw new NotFoundError(`Post with ID ${id} not found`);
	}
};
