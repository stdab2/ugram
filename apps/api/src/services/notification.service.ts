import type { Prisma, NotificationType } from "../../generated/prisma/client.js";

type CreateNotificationInput = {
	tx: Prisma.TransactionClient;
	type: NotificationType;
	recipientId: number;
	actorId: number;
	postId: number;
	messageId?: number | null;
};

export async function createNotification({
	tx,
	type,
	recipientId,
	actorId,
	postId,
	messageId,
}: CreateNotificationInput) {
	if (recipientId === actorId) {
		return null;
	}

	return tx.notification.create({
		data: {
			type,
			recipientId,
			actorId,
			postId,
			messageId: messageId ?? null,
		},
	});
}

type DeleteLikeNotificationInput = {
	tx: Prisma.TransactionClient;
	recipientId: number;
	actorId: number;
	postId: number;
};

export async function deleteLikeNotification({
	tx,
	recipientId,
	actorId,
	postId,
}: DeleteLikeNotificationInput) {
	if (recipientId === actorId) {
		return;
	}

	await tx.notification.deleteMany({
		where: {
			type: "LIKE",
			recipientId,
			actorId,
			postId,
		},
	});
}
