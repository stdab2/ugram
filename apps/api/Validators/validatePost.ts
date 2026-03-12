/**
 * Post input validators
 * Centralized validation logic for post operations
 */

import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { BadRequestError, NotFoundError, PermissionError } from "./errors.js";
import { UserContext } from "../src/types/userContext.types.js";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
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

/**
 * Validate post ownership by connected user
 * @param connectedUser - Currently authenticated user
 * @param id - Post ID to check
 * @throws {PermissionError} If user does not own the post
 */
export const validatePostOwnership = async (
	id: number,
	connectedUser: UserContext["user"]
): Promise<void> => {
	const post = await prisma.post.findUnique({
		where: { id },
	});
	if (connectedUser?.id !== post?.authorId) {
		throw new PermissionError("User cannot modify other user's posts");
	}
};

/**
 * Validate connected user is creating its own post
 * @param connectedUser - Currently authenticated user
 * @param authorId - authorId of the post being created
 * @throws {PermissionError} If user is creating a post under another users id
 */
export const validatePostCreationOwnership = (
	authorId: number,
	connectedUser: UserContext["user"]
): void => {
	if (connectedUser?.id !== authorId) {
		throw new PermissionError("User cannot create another user's posts");
	}
};
