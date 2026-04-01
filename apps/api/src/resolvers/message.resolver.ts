import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Message } from "../../generated/prisma/client.js";
import { handlePrismaError } from "../../Validators/errors.js";
import {
	validateUserId,
	validateNonEmptyString,
	authenticateUser,
} from "../../Validators/validateUser.js";
import { validatePostId, validatePostExists } from "../../Validators/validatePost.js";
import {
	validateMessageId,
	validateMessageExists,
	validateMessageOwnership,
	validateMessageCreationOwnership,
} from "../../Validators/ValidateMessage.js";
import { UserContext } from "../types/userContext.types.js";
import { getDatabaseUrl } from "../database-url.js";

const adapter = new PrismaPg({
	connectionString: getDatabaseUrl(),
});

const prisma = new PrismaClient({
	adapter,
});

type CreateMessageArgs = {
	data: {
		content: string;
		authorId: number;
		postId: number;
	};
};

export const messageResolvers = {
	Query: {
		message: async (_: unknown, args: { id: number }, context: UserContext) => {
			authenticateUser(context.user);
			validateMessageId(args.id);

			return prisma.message.findUnique({
				where: { id: args.id },
			});
		},

		messages: async (
			_: unknown,
			args: { limit?: number; offset?: number },
			context: UserContext
		) => {
			authenticateUser(context.user);

			const limit = Math.min(Math.max(args.limit ?? 20, 0), 100);
			const offset = Math.max(args.offset ?? 0, 0);

			return prisma.message.findMany({
				take: limit,
				skip: offset,
				orderBy: { createdAt: "desc" },
			});
		},

		messagesByPost: async (
			_: unknown,
			args: { postId: number; limit?: number; offset?: number },
			context: UserContext
		) => {
			authenticateUser(context.user);
			validatePostId(args.postId);

			const limit = Math.min(Math.max(args.limit ?? 20, 0), 100);
			const offset = Math.max(args.offset ?? 0, 0);

			return prisma.message.findMany({
				where: { postId: args.postId },
				take: limit,
				skip: offset,
				orderBy: { createdAt: "asc" },
			});
		},

		messagesByAuthor: async (
			_: unknown,
			args: { authorId: number; limit?: number; offset?: number },
			context: UserContext
		) => {
			authenticateUser(context.user);
			validateUserId(args.authorId);

			const limit = Math.min(Math.max(args.limit ?? 20, 0), 100);
			const offset = Math.max(args.offset ?? 0, 0);

			return prisma.message.findMany({
				where: { authorId: args.authorId },
				take: limit,
				skip: offset,
				orderBy: { createdAt: "desc" },
			});
		},
	},

	Message: {
		author: async (parent: Message, _: unknown, context: UserContext) => {
			authenticateUser(context.user);

			return prisma.userUgram.findUnique({
				where: { id: parent.authorId },
			});
		},

		post: async (parent: Message, _: unknown, context: UserContext) => {
			authenticateUser(context.user);

			return prisma.post.findUnique({
				where: { id: parent.postId },
			});
		},
	},

	Mutation: {
		createMessage: async (_: unknown, { data }: CreateMessageArgs, context: UserContext) => {
			authenticateUser(context.user);

			const { content, authorId, postId } = data;
			validateUserId(authorId);
			validatePostId(postId);
			validateNonEmptyString(content, "Message content");
			validateMessageCreationOwnership(authorId, context.user);
			await validatePostExists(postId);

			try {
				return await prisma.message.create({
					data: {
						content,
						authorId,
						postId,
					},
					include: {
						author: true,
						post: true,
					},
				});
			} catch (error: unknown) {
				handlePrismaError(error, "Message");
			}
		},

		deleteMessage: async (_: unknown, args: { id: number }, context: UserContext) => {
			authenticateUser(context.user);
			validateMessageId(args.id);
			await validateMessageExists(args.id);
			await validateMessageOwnership(args.id, context.user);

			try {
				return await prisma.message.delete({
					where: { id: args.id },
				});
			} catch (error: unknown) {
				handlePrismaError(error, "Message");
			}
		},

		updateMessage: async (
			_: unknown,
			args: { id: number; content: string },
			context: UserContext
		) => {
			authenticateUser(context.user);
			validateMessageId(args.id);
			validateNonEmptyString(args.content, "Message content");
			await validateMessageExists(args.id);
			await validateMessageOwnership(args.id, context.user);

			try {
				return await prisma.message.update({
					where: { id: args.id },
					data: {
						content: args.content,
					},
					include: {
						author: true,
						post: true,
					},
				});
			} catch (error: unknown) {
				handlePrismaError(error, "Message");
			}
		},
	},
};
