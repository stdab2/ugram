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

export const validateLikePostId = (postId: number): void => {
	if (!postId || postId <= 0) {
		throw new BadRequestError("Invalid post ID");
	}
};

export const validateLikePostExists = async (postId: number): Promise<void> => {
	const post = await prisma.post.findUnique({
		where: { id: postId },
	});

	if (!post) {
		throw new NotFoundError(`Post with ID ${postId} not found`);
	}
};

export const validatePostNotAlreadyLiked = async (
	postId: number,
	userId: number
): Promise<void> => {
	const like = await prisma.like.findUnique({
		where: {
			userId_postId: {
				userId,
				postId,
			},
		},
	});

	if (like) {
		throw new BadRequestError("Post already liked");
	}
};

export const validateLikeExists = async (postId: number, userId: number): Promise<void> => {
	const like = await prisma.like.findUnique({
		where: {
			userId_postId: {
				userId,
				postId,
			},
		},
	});

	if (!like) {
		throw new BadRequestError("Like does not exist");
	}
};
