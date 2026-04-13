import { prisma } from "../lib/prisma.js";
import { authenticateUser } from "../../Validators/validateUser.js";
import { UserContext } from "../types/userContext.types.js";

function validateNotificationId(id: number) {
	if (!Number.isInteger(id) || id <= 0) {
		throw new Error("Invalid notification ID.");
	}
}

export const notificationResolvers = {
	NotificationType: {
		LIKE: "LIKE",
		COMMENT: "COMMENT",
	},

	Query: {
		notifications: async (
			_: unknown,
			args: { limit?: number; offset?: number },
			context: UserContext
		) => {
			authenticateUser(context.user);

			const limit = Math.min(Math.max(args.limit ?? 20, 0), 100);
			const offset = Math.max(args.offset ?? 0, 0);

			return prisma.notification.findMany({
				where: { recipientId: context.user!.id },
				take: limit,
				skip: offset,
				orderBy: { createdAt: "desc" },
				include: {
					actor: true,
					post: true,
				},
			});
		},

		unreadNotificationCount: async (_: unknown, __: unknown, context: UserContext) => {
			authenticateUser(context.user);

			return prisma.notification.count({
				where: {
					recipientId: context.user!.id,
					readAt: null,
				},
			});
		},
	},

	Mutation: {
		markNotificationRead: async (_: unknown, args: { id: number }, context: UserContext) => {
			authenticateUser(context.user);
			validateNotificationId(args.id);

			const notification = await prisma.notification.findFirst({
				where: {
					id: args.id,
					recipientId: context.user!.id,
				},
			});

			if (!notification) {
				throw new Error("Notification not found.");
			}

			return prisma.notification.update({
				where: { id: notification.id },
				data: { readAt: new Date() },
				include: {
					actor: true,
					post: true,
				},
			});
		},

		markAllNotificationsRead: async (_: unknown, __: unknown, context: UserContext) => {
			authenticateUser(context.user);

			const result = await prisma.notification.updateMany({
				where: {
					recipientId: context.user!.id,
					readAt: null,
				},
				data: { readAt: new Date() },
			});

			return result.count;
		},
	},
};
