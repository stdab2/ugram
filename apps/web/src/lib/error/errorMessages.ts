import type { AppError } from "@/types/error";
import { getErrorMessage } from "./errorClassifier";

/**
 * User-friendly error messages for different error types and codes
 */

const ERROR_MESSAGES: Record<string, string> = {
	// Network errors
	NETWORK_ERROR: "Network error. Please check your connection.",
	ECONNREFUSED: "Could not connect to the server. Please try again.",
	ETIMEDOUT: "Request timed out. Please try again.",
	ENOTFOUND: "Server not found. Please check your connection.",
	OFFLINE: "You appear to be offline. Please check your connection.",
	FAILED_TO_FETCH: "Network error. Please check your connection.",
	"FAILED TO FETCH": "Network error. Please check your connection.",

	// Auth errors
	UNAUTHORIZED: "Session expired. Please login again.",
	FORBIDDEN: "You do not have permission to perform this action.",
	AUTH_REQUIRED: "Please login to continue.",
	INVALID_TOKEN: "Session expired. Please login again.",

	// Validation errors
	VALIDATION_ERROR: "Invalid input. Please check your data.",
	INVALID_INPUT: "Invalid input. Please check your data.",
	MISSING_REQUIRED_FIELD: "Please fill in all required fields.",

	// Parse errors
	PARSE_ERROR: "Something went wrong while processing the response.",
	JSON_PARSE_ERROR: "Something went wrong while processing the response.",

	// GraphQL errors
	GRAPHQL_ERROR: "Something went wrong. Please try again.",
	GRAPHQL_PARSE_FAILED: "Invalid request. Please try again.",
	INTERNAL_SERVER_ERROR: "Server error. Please try again later.",

	// Common server errors
	INTERNAL_ERROR: "Server error. Please try again later.",
	SERVICE_UNAVAILABLE: "Service is temporarily unavailable. Please try again later.",
	BAD_REQUEST: "Invalid request. Please check your data.",
	NOT_FOUND: "Resource not found.",
	CONFLICT: "This action conflicts with another operation. Please try again.",
	RATE_LIMITED: "Too many requests. Please wait a moment before trying again.",

	// File upload errors
	FILE_TOO_LARGE: "File is too large. Please choose a smaller file.",
	INVALID_FILE_TYPE: "Invalid file type. Please choose a supported format.",
	UPLOAD_FAILED: "File upload failed. Please try again.",

	// Generic fallback
	UNKNOWN_ERROR: "Something went wrong. Please try again.",
};

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: AppError | unknown): string {
	// Extract error code and message
	let code = "";
	let message = "";
	let errorType: string | undefined;

	// If it's already an AppError, extract its properties
	if (error && typeof error === "object" && "code" in error) {
		const appErr = error as AppError;
		code = appErr.code;
		message = appErr.message || "";
		errorType = appErr.type;

		if (code === "CONFLICT") {
			const conflictMessage = getConflictMessage(message);
			if (conflictMessage) {
				return conflictMessage;
			}
		}

		// First try to find by code
		const codeMessage = ERROR_MESSAGES[code];
		if (codeMessage) {
			return codeMessage;
		}
	} else if (error && typeof error === "object") {
		const err = error as Record<string, unknown>;
		code = (err.code as string) || "";
		message = extractErrorMessage(error);

		if (code === "CONFLICT") {
			const conflictMessage = getConflictMessage(message);
			if (conflictMessage) {
				return conflictMessage;
			}
		}
	} else if (typeof error === "string") {
		message = error;
	}

	// Look up message by code
	if (code && ERROR_MESSAGES[code]) {
		return ERROR_MESSAGES[code];
	}

	// Use error type as fallback
	if (errorType === "NETWORK") {
		return ERROR_MESSAGES.NETWORK_ERROR;
	}

	// Check if message contains common error patterns
	if (message) {
		const lowerMessage = message.toLowerCase();

		if (
			lowerMessage.includes("network") ||
			lowerMessage.includes("fetch") ||
			lowerMessage.includes("failed to fetch")
		) {
			return ERROR_MESSAGES.NETWORK_ERROR;
		}

		if (lowerMessage.includes("timeout")) {
			return ERROR_MESSAGES.ETIMEDOUT;
		}

		if (lowerMessage.includes("unauthorized") || lowerMessage.includes("401")) {
			return ERROR_MESSAGES.UNAUTHORIZED;
		}

		if (lowerMessage.includes("forbidden") || lowerMessage.includes("403")) {
			return ERROR_MESSAGES.FORBIDDEN;
		}

		if (lowerMessage.includes("404") || lowerMessage.includes("not found")) {
			return ERROR_MESSAGES.NOT_FOUND;
		}

		if (lowerMessage.includes("validation") || lowerMessage.includes("400")) {
			return ERROR_MESSAGES.VALIDATION_ERROR;
		}

		if (lowerMessage.includes("500") || lowerMessage.includes("internal")) {
			return ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
		}

		if (lowerMessage.includes("503") || lowerMessage.includes("unavailable")) {
			return ERROR_MESSAGES.SERVICE_UNAVAILABLE;
		}

		if (lowerMessage.includes("json") || lowerMessage.includes("parse")) {
			return ERROR_MESSAGES.PARSE_ERROR;
		}

		// If message looks clean, use it as is
		if (message.length < 200 && !message.startsWith("[")) {
			return message;
		}
	}

	return ERROR_MESSAGES.UNKNOWN_ERROR;
}

function getConflictMessage(message: string): string | undefined {
	const lowerMessage = message.toLowerCase();

	if (lowerMessage.includes("phone")) {
		return "This phone number is already used by another account.";
	}

	if (lowerMessage.includes("email")) {
		return "This email is already used by another account.";
	}

	if (lowerMessage.includes("username") || lowerMessage.includes("user name")) {
		return "This username is already taken.";
	}

	if (lowerMessage.includes("already exists")) {
		return "This value is already used by another account.";
	}

	return undefined;
}

/**
 * Extract error message from various error formats
 */
function extractErrorMessage(error: unknown): string {
	const msg = getErrorMessage(error);
	return msg || "";
}

/**
 * Get error message by code (for programmatic use)
 */
export function getMessageByCode(code: string): string {
	return ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Add custom error message mapping
 */
export function addErrorMessage(code: string, message: string): void {
	ERROR_MESSAGES[code] = message;
}

/**
 * Register multiple custom error messages
 */
export function registerErrorMessages(messages: Record<string, string>): void {
	Object.assign(ERROR_MESSAGES, messages);
}
