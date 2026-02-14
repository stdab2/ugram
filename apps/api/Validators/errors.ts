/**
 * Centralized error handling for the API
 * Provides custom error classes with HTTP status codes for GraphQL
 */

import { GraphQLError } from "graphql";

/**
 * Base class for all validation errors
 * Extends GraphQLError for seamless Apollo Server integration
 */
export class ValidationError extends GraphQLError {
	constructor(message: string, code: string, httpStatus: number) {
		super(message, {
			extensions: {
				code,
				http: { status: httpStatus },
			},
		});
		this.name = "ValidationError";
	}
}

/**
 * 400 Bad Request - Invalid input format or validation failure
 */
export class BadRequestError extends ValidationError {
	constructor(message: string) {
		super(message, "BAD_REQUEST", 400);
		this.name = "BadRequestError";
	}
}

/**
 * 404 Not Found - Resource does not exist
 */
export class NotFoundError extends ValidationError {
	constructor(message: string) {
		super(message, "NOT_FOUND", 404);
		this.name = "NotFoundError";
	}
}

/**
 * 409 Conflict - Duplicate resource (email, username, etc.)
 */
export class ConflictError extends ValidationError {
	constructor(message: string) {
		super(message, "CONFLICT", 409);
		this.name = "ConflictError";
	}
}

/**
 * 500 Internal Server Error - Unexpected server-side errors
 */
export class InternalServerError extends ValidationError {
	constructor(message: string = "An unexpected error occurred") {
		super(message, "INTERNAL_SERVER_ERROR", 500);
		this.name = "InternalServerError";
	}
}

/**
 * Handle Prisma errors and map them to appropriate HTTP error codes
 * Can be used by any entity (User, Post, Hashtag, etc.)
 * @param error - The error caught from Prisma operation
 * @param resourceName - Name of the resource (e.g., "User", "Post", "Comment")
 * @throws {ConflictError} For unique constraint violations (P2002)
 * @throws {NotFoundError} For record not found (P2025)
 * @throws {BadRequestError} For foreign key violations (P2003)
 * @throws {InternalServerError} For other database errors
 */
export const handlePrismaError = (error: unknown, resourceName: string = "Resource"): never => {
	// Check if it's a Prisma error with a code
	if (typeof error === "object" && error !== null && "code" in error) {
		const prismaError = error as { code: string; meta?: { target?: string[] } };

		switch (prismaError.code) {
			case "P2002": {
				// Unique constraint violation
				const field = prismaError.meta?.target?.[0] || "field";
				throw new ConflictError(`${resourceName} with this ${field} already exists`);
			}
			case "P2025": {
				// Record not found
				throw new NotFoundError(`${resourceName} not found`);
			}
			case "P2003": {
				// Foreign key constraint violation
				throw new BadRequestError(`Invalid reference: related ${resourceName.toLowerCase()} does not exist`);
			}
			default: {
				// Other Prisma errors
				console.error("Prisma error:", prismaError);
				throw new InternalServerError("Database operation failed");
			}
		}
	}

	// Non-Prisma errors
	console.error("Unexpected error:", error);
	throw new InternalServerError();
};
