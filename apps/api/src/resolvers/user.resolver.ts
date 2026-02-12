import { PrismaClient, UserUgram, Prisma } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import {
	CreateUserInput,
	UpdateUserInput,
	QueryUsersInput,
} from "../types/user.types.js";
import {
	UserValidationError,
	validateEmail,
	validateUserName,
	validatePassword,
	validateUserId,
	validateNonEmptyString,
	validatePhoneNumber,
	validateUserExists,
} from "../../Validators/validateUser.js";
import { saveUploadedImage } from "../../services/image.service.js";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
	adapter,
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
		user: async (_: void, args: { id: number }): Promise<UserUgram | null> => {
			validateUserId(args.id);
			return prisma.userUgram.findUnique({
				where: { id: args.id },
			});
		},

		/**
		 * Get multiple users with pagination
		 * @param limit - Max number of users to return
		 * @param offset - Number of users to skip
		 */
		users: async (_: void, args: QueryUsersInput): Promise<UserUgram[]> => {
			const limit = Math.min(args.limit || 10, 100); // Cap at 100
			const offset = Math.max(args.offset || 0, 0);

			return prisma.userUgram.findMany({
				take: limit,
				skip: offset,
			});
		},
	},

	UserUgram: {
		/**
		 * Get posts for a user
		 */
		posts: async (parent: UserUgram) => {
			return prisma.post.findMany({
				where: { authorId: parent.id },
			});
		},
	},

	Mutation: {
		/**
		 * Create a new user
		 * @throws {UserValidationError} If input validation fails
		 * @throws {Error} If user already exists
		 */
		createUser: async (_: void, args: CreateUserInput): Promise<UserUgram> => {
			// Validate inputs
			validateUserName(args.userName);
			validateEmail(args.email);
			validatePassword(args.password);
			validateNonEmptyString(args.firstName, "First name");
			validateNonEmptyString(args.lastName, "Last name");
			validatePhoneNumber(args.phoneNumber);

			// Handle profile picture upload
			let pictureUrl: string | undefined;
			if (args.picture) {
				pictureUrl = await saveUploadedImage(args.picture, "profile");
			}

			try {
				return await prisma.userUgram.create({
					data: {
						userName: args.userName,
						email: args.email,
						password: args.password,
						firstName: args.firstName,
						lastName: args.lastName,
						phoneNumber: args.phoneNumber,
						picture: pictureUrl,
					},
				});
			} catch (error: any) {
				// P2002: Unique constraint violation (duplicate email, username, etc.)
				if (error.code === "P2002") {
					const field = error.meta?.target?.[0] || "field";
					throw new UserValidationError(`User with this ${field} already exists`);
				}
				throw error;
			}
		},

		/**
		 * Update an existing user
		 * @throws {UserValidationError} If update data is invalid
		 * @throws {Error} If user not found
		 */
		updateUser: async (_: void, args: UpdateUserInput): Promise<UserUgram> => {
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
				data.password = args.password;
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
				if (args.phoneNumber === "") {
					data.phoneNumber = "";
				} else {
					validatePhoneNumber(args.phoneNumber);
					data.phoneNumber = args.phoneNumber;
				}
			}

			if (args.picture !== undefined) {
				const pictureUrl = await saveUploadedImage(args.picture, "profile");
				data.picture = pictureUrl;
			}

			if (Object.keys(data).length === 0) {
				throw new UserValidationError("No fields to update");
			}

			try {
				return await prisma.userUgram.update({
					where: { id: args.id },
					data,
				});
			} catch (error: any) {
				// P2002: Unique constraint violation (duplicate email, username, etc.)
				if (error.code === "P2002") {
					const field = error.meta?.target?.[0] || "field";
					throw new UserValidationError(`User with this ${field} already exists`);
				}
				throw error;
			}
		},
	},
};

