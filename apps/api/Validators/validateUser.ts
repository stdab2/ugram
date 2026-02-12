/**
 * User input validators
 * Centralized validation logic for user operations
 */

import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
	adapter,
});

export class UserValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UserValidationError";
	}
}

/**
 * Validate user ID
 * @param id - User ID to validate
 * @throws {UserValidationError} If invalid
 */
export const validateUserId = (id: number): void => {
	if (!id || id <= 0) {
		throw new UserValidationError("Invalid user ID");
	}
};

/**
 * Validate email format
 * @param email - Email to validate
 * @throws {UserValidationError} If invalid
 */
export const validateEmail = (email: string): void => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		throw new UserValidationError("Invalid email format");
	}
};

/**
 * Validate username
 * Must be 3-20 characters
 * @param userName - Username to validate
 * @throws {UserValidationError} If invalid
 */
export const validateUserName = (userName: string): void => {
	if (userName.length < 3 || userName.length > 20) {
		throw new UserValidationError("Username must be between 3-20 characters");
	}
};

/**
 * Validate password
 * Must be at least 6 characters
 * @param password - Password to validate
 * @throws {UserValidationError} If invalid
 */
export const validatePassword = (password: string): void => {
	if (password.length < 6) {
		throw new UserValidationError("Password must be at least 6 characters");
	}
};

/**
 * Validate phone number format
 * @param phoneNumber - Phone number to validate
 * @throws {UserValidationError} If invalid
 */
export const validatePhoneNumber = (phoneNumber: string): void => {
	// Allow optional phone numbers (empty/undefined handled elsewhere)
	if (!phoneNumber || phoneNumber.trim() === "") {
		return; // Phone number is optional
	}
	// Basic phone validation: at least 7 digits, allows common separators
	const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
	if (!phoneRegex.test(phoneNumber)) {
		throw new UserValidationError("Invalid phone number format");
	}
};

/**
 * Validate non-empty string
 * @param value - String value to validate
 * @param fieldName - Name of the field being validated (for error message)
 * @throws {UserValidationError} If invalid
 */
export const validateNonEmptyString = (value: string, fieldName: string = "Value"): void => {
	if (!value || value.trim().length === 0) {
		throw new UserValidationError(`${fieldName} cannot be empty`);
	}
};

/**
 * Validate user exists in database
 * @param userId - User ID to check
 * @throws {UserValidationError} If user not found
 */
export const validateUserExists = async (userId: number): Promise<void> => {
	const user = await prisma.userUgram.findUnique({
		where: { id: userId },
	});
	if (!user) {
		throw new UserValidationError(`User with ID ${userId} not found`);
	}
};

/**
 * Validate multiple users exist in database
 * @param userIds - Array of user IDs to check
 * @throws {UserValidationError} If any user not found
 */
export const validateUsersExist = async (userIds: number[]): Promise<void> => {
	const users = await prisma.userUgram.findMany({
		where: { id: { in: userIds } },
		select: { id: true },
	});

	if (users.length !== userIds.length) {
		throw new UserValidationError("One or more users do not exist");
	}
};