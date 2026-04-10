/**
 * Message input validators
 * Centralized validation logic for message operations
 */
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { BadRequestError, NotFoundError, PermissionError } from "./errors.js";
import { UserContext } from "../src/types/userContext.types.js";
import { getDatabaseUrl } from "../src/database-url.js";

const adapter = new PrismaPg({
	connectionString: getDatabaseUrl(),
});

const prisma = new PrismaClient({
	adapter,
});

/**
 * Validate message ID
 * @param id - Message ID to validate
 * @throws {BadRequestError} If invalid
 */
export const validateMessageId = (id: number): void => {
	if (!id || id <= 0) {
		throw new BadRequestError("Invalid message ID");
	}
};

/**
 * Validate message exists in database
 * @param id - Message ID to check
 * @throws {NotFoundError} If message not found
 */
export const validateMessageExists = async (id: number): Promise<void> => {
	const message = await prisma.message.findUnique({
		where: { id },
	});
	if (!message) {
		throw new NotFoundError(`Message with ID ${id} not found`);
	}
};

/**
 * Validate message ownership by connected user
 * @param connectedUser - Currently authenticated user
 * @param id - Message ID to check
 * @throws {PermissionError} If user does not own the message
 */
export const validateMessageOwnership = async (
	id: number,
	connectedUser: UserContext["user"]
): Promise<void> => {
	const message = await prisma.message.findUnique({
		where: { id },
	});

	if (connectedUser?.id !== message?.authorId) {
		console.warn("User attempted to modify/delete another user's message", {
			authenticatedUserId: connectedUser?.id,
			targetUserId: message?.authorId,
			action: "updateMessage/deleteMessage",
			messageId: id,
		});
		throw new PermissionError("User cannot modify/delete other user's messages");
	}
};

/**
 * Validate connected user is creating its own message
 * @param connectedUser - Currently authenticated user
 * @param authorId - authorId of the message being created
 * @throws {PermissionError} If user is creating a message under another users id
 */
export const validateMessageCreationOwnership = (
	authorId: number,
	connectedUser: UserContext["user"]
): void => {
	if (connectedUser?.id !== authorId) {
		console.warn("User attempted to create another user's message", {
			authenticatedUserId: connectedUser?.id,
			targetUserId: authorId,
			action: "createMessage",
		});
		throw new PermissionError("User cannot create another user's messages");
	}
};
