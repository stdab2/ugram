import { PrismaClient, UserUgram, Prisma } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import { CreateUserInput, UpdateUserInput, QueryUsersInput } from "../types/user.types.js";
import {
	validateEmail,
	validateUserName,
	validatePassword,
	validateUserId,
	validateNonEmptyString,
	validatePhoneNumber,
	validateUserExists,
	authenticateUser,
	authenticateUserModifiesSelf,
} from "../../Validators/validateUser.js";
import { BadRequestError, handlePrismaError } from "../../Validators/errors.js";
import { UserContext } from "../types/userContext.types.js";
import { getDatabaseUrl } from "../database-url.js";

const SALT_ROUNDS = 10;

const adapter = new PrismaPg({
	connectionString: getDatabaseUrl(),
});

const prisma = new PrismaClient({
	adapter,
});

type UserWithFollowMeta = UserUgram & {
	_count?: {
		followers: number;
		following: number;
	};
	followers?: Array<{
		followerId: number;
	}>;
};

const userWithFollowMetaInclude = (currentUserId?: number): Prisma.UserUgramInclude => ({
	_count: {
		select: {
			followers: true,
			following: true,
		},
	},
	...(currentUserId
		? {
				followers: {
					where: { followerId: currentUserId },
					select: { followerId: true },
					take: 1,
				},
			}
		: {}),
});

/**
 * User Resolvers
 * Handles all user-related GraphQL queries and mutations
 */
export const userResolvers = {
	Query: {
		/**
		 * Get a single user by ID
		 * @param id - User ID
		 * @throws {Error} If user not found
		 */
		user: async (
			_: void,
			args: { id: number },
			context: UserContext
		): Promise<UserUgram | null> => {
			authenticateUser(context.user);
			validateUserId(args.id);
			return prisma.userUgram.findUnique({
				where: { id: args.id },
				include: userWithFollowMetaInclude(context.user?.id),
			});
		},

		userByUserName: async (_: void, args: { userName: string }, context: UserContext) => {
			authenticateUser(context.user);
			return prisma.userUgram.findUnique({
				where: { userName: args.userName },
				include: userWithFollowMetaInclude(context.user?.id),
			});
		},

		usersByUserNames: async (_: void, args: { userNames: string[] }, context: UserContext) => {
			authenticateUser(context.user);
			const requested = Array.from(new Set(args.userNames.map((u) => u.trim()).filter(Boolean)));

			const users = await prisma.userUgram.findMany({
				where: { userName: { in: requested } },
				include: userWithFollowMetaInclude(context.user?.id),
			});

			const found = new Set(users.map((u) => u.userName));
			const missingUserNames = requested.filter((u) => !found.has(u));

			return { users, missingUserNames };
		},

		/**
		 * Get multiple users with pagination
		 * @param limit - Max number of users to return
		 * @param offset - Number of users to skip
		 */
		users: async (_: void, args: QueryUsersInput, context: UserContext): Promise<UserUgram[]> => {
			authenticateUser(context.user);
			const limit = Math.min(args.limit || 10, 100); // Cap at 100
			const offset = Math.max(args.offset || 0, 0);

			return prisma.userUgram.findMany({
				orderBy: [{ followers: { _count: "desc" } }, { id: "asc" }],
				take: limit,
				skip: offset,
				include: userWithFollowMetaInclude(context.user?.id),
			});
		},
	},

	UserUgram: {
		/**
		 * Get posts for a user
		 */
		posts: async (parent: UserUgram, _: unknown, context: UserContext) => {
			authenticateUser(context.user);
			return prisma.post.findMany({
				where: { authorId: parent.id },
				include: {
					_count: {
						select: { messages: true },
					},
				},
			});
		},

		followerCount: async (parent: UserWithFollowMeta, _: unknown, context: UserContext) => {
			authenticateUser(context.user);

			if (parent._count?.followers !== undefined) {
				return parent._count.followers;
			}

			return prisma.follow.count({
				where: { followingId: parent.id },
			});
		},

		followingCount: async (parent: UserWithFollowMeta, _: unknown, context: UserContext) => {
			authenticateUser(context.user);

			if (parent._count?.following !== undefined) {
				return parent._count.following;
			}

			return prisma.follow.count({
				where: { followerId: parent.id },
			});
		},

		isFollowedByCurrentUser: async (
			parent: UserWithFollowMeta,
			_: unknown,
			context: UserContext
		) => {
			authenticateUser(context.user);

			if (context.user!.id === parent.id) {
				return false;
			}

			if (parent.followers !== undefined) {
				return parent.followers.length > 0;
			}

			const relation = await prisma.follow.findUnique({
				where: {
					followerId_followingId: {
						followerId: context.user!.id,
						followingId: parent.id,
					},
				},
				select: { followerId: true },
			});

			return !!relation;
		},
	},

	Mutation: {
		/**
		 * Create a new user
		 * @throws {BadRequestError} If input validation fails
		 * @throws {ConflictError} If user already exists
		 */
		createUser: async (_: void, args: CreateUserInput) => {
			// Validate inputs
			validateUserName(args.userName);
			validateEmail(args.email);
			validatePassword(args.password);
			validateNonEmptyString(args.firstName, "First name");
			validateNonEmptyString(args.lastName, "Last name");

			const normalizedPhoneNumber = args.phoneNumber?.trim() ? args.phoneNumber.trim() : null;

			if (normalizedPhoneNumber) {
				validatePhoneNumber(normalizedPhoneNumber);
			}

			// Handle profile picture upload - optional for now, can be added later

			// let pictureUrl: string | undefined;
			// let imageKey: string | undefined;
			// if (args.picture) {
			// 	({ key: pictureUrl, imageKey } = await saveUploadedImage(args.picture, "profile"));
			// }

			// Hash password before storing
			const hashedPassword = await bcrypt.hash(args.password, SALT_ROUNDS);

			try {
				return await prisma.userUgram.create({
					data: {
						userName: args.userName,
						email: args.email,
						password: hashedPassword,
						firstName: args.firstName,
						lastName: args.lastName,
						phoneNumber: normalizedPhoneNumber,
					},
				});
			} catch (error: unknown) {
				throw handlePrismaError(error, "User");
			}
		},

		/**
		 * Update an existing user
		 * @throws {BadRequestError} If update data is invalid
		 * @throws {NotFoundError} If user not found
		 * @throws {ConflictError} If duplicate field
		 * @throws {PermissionError} If connected user tries to modify another user
		 */
		updateUser: async (_: void, args: UpdateUserInput, context: UserContext) => {
			authenticateUser(context.user);
			authenticateUserModifiesSelf(context.user, args.id);
			validateUserId(args.id);

			// Check if user exists before attempting update
			await validateUserExists(args.id);

			// Build data object with only provided fields
			const data: Prisma.UserUgramUpdateInput = {};

			if (args.userName !== undefined) {
				validateUserName(args.userName);
				data.userName = args.userName;
			}

			if (args.email !== undefined) {
				validateEmail(args.email);
				data.email = args.email;
			}

			if (args.password !== undefined) {
				validatePassword(args.password);
				// Hash password before storing
				data.password = await bcrypt.hash(args.password, SALT_ROUNDS);
			}

			if (args.firstName !== undefined) {
				validateNonEmptyString(args.firstName, "First name");
				data.firstName = args.firstName;
			}

			if (args.lastName !== undefined) {
				validateNonEmptyString(args.lastName, "Last name");
				data.lastName = args.lastName;
			}

			if (args.phoneNumber !== undefined) {
				const normalizedPhoneNumber = args.phoneNumber.trim() ? args.phoneNumber.trim() : null;
				if (normalizedPhoneNumber) {
					validatePhoneNumber(normalizedPhoneNumber);
				}
				data.phoneNumber = normalizedPhoneNumber;
			}

			// Handle profile picture upload - optional for now, can be added later

			// if (args.picture !== undefined) {
			// 	const { key: pictureUrl, imageKey } = await saveUploadedImage(args.picture, "profile");
			// 	data.picture = pictureUrl;
			// }

			if (Object.keys(data).length === 0) {
				throw new BadRequestError("No fields to update");
			}

			try {
				return await prisma.userUgram.update({
					where: { id: args.id },
					data,
				});
			} catch (error: unknown) {
				throw handlePrismaError(error, "User");
			}
		},

		/**
		 * Delete the authenticated user's account
		 * Requires password verification for password-based accounts
		 * @throws {AuthenticationError} If password is wrong or user is not authenticated
		 * @throws {NotFoundError} If user not found
		 */
		deleteUser: async (_: void, args: { password?: string }, context: UserContext) => {
			authenticateUser(context.user);

			const user = await prisma.userUgram.findUnique({
				where: { id: context.user!.id },
			});

			if (!user) {
				throw handlePrismaError(new Error("User not found"), "User");
			}

			if (user.password) {
				if (!args.password) {
					throw new BadRequestError("Password is required to delete your account");
				}
				const isValid = await bcrypt.compare(args.password, user.password);
				if (!isValid) {
					throw new BadRequestError("Incorrect password");
				}
			}

			try {
				await prisma.userUgram.delete({ where: { id: user.id } });
				return true;
			} catch (error: unknown) {
				throw handlePrismaError(error, "User");
			}
		},
	},
};
