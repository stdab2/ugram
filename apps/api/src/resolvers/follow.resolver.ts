import { BadRequestError, NotFoundError } from "../../Validators/errors.js";
import { authenticateUser, validateUserId } from "../../Validators/validateUser.js";
import { prisma } from "../lib/prisma.js";
import { UserContext } from "../types/userContext.types.js";

const validateCannotFollowSelf = (currentUserId: number, targetUserId: number) => {
	if (currentUserId === targetUserId) {
		throw new BadRequestError("You cannot follow yourself");
	}
};

const validateTargetUserExists = async (targetUserId: number) => {
	const user = await prisma.userUgram.findUnique({
		where: { id: targetUserId },
		select: { id: true },
	});
	if (!user) {
		throw new NotFoundError("Target user not found");
	}
};

export const followResolvers = {
	Query: {
		followers: async (
			_: unknown,
			{ userId, limit, offset }: { userId: number; limit?: number; offset?: number },
			context: UserContext
		) => {
			authenticateUser(context.user);
			validateUserId(userId);
			const take = Math.min(Math.max(limit ?? 20, 0), 100);
			const skip = Math.max(offset ?? 0, 0);

			const rows = await prisma.follow.findMany({
				where: { followingId: userId },
				include: { follower: true },
				orderBy: { createdAt: "desc" },
				take,
				skip,
			});

			return rows.map((row) => row.follower);
		},

		following: async (
			_: unknown,
			{ userId, limit, offset }: { userId: number; limit?: number; offset?: number },
			context: UserContext
		) => {
			authenticateUser(context.user);
			validateUserId(userId);
			const take = Math.min(Math.max(limit ?? 20, 0), 100);
			const skip = Math.max(offset ?? 0, 0);

			const rows = await prisma.follow.findMany({
				where: { followerId: userId },
				include: { following: true },
				orderBy: { createdAt: "desc" },
				take,
				skip,
			});

			return rows.map((row) => row.following);
		},

		isFollowing: async (_: unknown, { userId }: { userId: number }, context: UserContext) => {
			authenticateUser(context.user);
			validateUserId(userId);
			validateCannotFollowSelf(context.user!.id, userId);

			const relation = await prisma.follow.findUnique({
				where: {
					followerId_followingId: {
						followerId: context.user!.id,
						followingId: userId,
					},
				},
				select: { followerId: true },
			});

			return !!relation;
		},
	},

	Mutation: {
		followUser: async (_: unknown, { userId }: { userId: number }, context: UserContext) => {
			authenticateUser(context.user);
			validateUserId(userId);
			validateCannotFollowSelf(context.user!.id, userId);
			await validateTargetUserExists(userId);

			await prisma.follow.upsert({
				where: {
					followerId_followingId: {
						followerId: context.user!.id,
						followingId: userId,
					},
				},
				update: {},
				create: {
					followerId: context.user!.id,
					followingId: userId,
				},
			});

			return true;
		},

		unfollowUser: async (_: unknown, { userId }: { userId: number }, context: UserContext) => {
			authenticateUser(context.user);
			validateUserId(userId);
			validateCannotFollowSelf(context.user!.id, userId);

			await prisma.follow.deleteMany({
				where: {
					followerId: context.user!.id,
					followingId: userId,
				},
			});

			return true;
		},
	},
};
