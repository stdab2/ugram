import type { ErrorType } from "@/types/error";

/**
 * Classify errors into specific types for handling
 */

export function classifyError(error: unknown): ErrorType {
	if (isNetworkError(error)) {
		return "NETWORK";
	}
	if (isAuthError(error)) {
		return "AUTH";
	}
	if (isGraphQLError(error)) {
		return "GRAPHQL";
	}
	if (isParseError(error)) {
		return "PARSE";
	}
	if (isValidationError(error)) {
		return "VALIDATION";
	}
	return "UNKNOWN";
}

export function isAuthError(error: unknown): boolean {
	if (!error) return false;

	// Check for status code 401 or 403
	const statusCode = getStatusCode(error);
	if (statusCode === 401 || statusCode === 403) {
		return true;
	}

	// Check for auth-related error messages
	const message = getErrorMessage(error);
	if (
		message &&
		(message.toLowerCase().includes("unauthorized") ||
			message.toLowerCase().includes("forbidden") ||
			message.toLowerCase().includes("authentication") ||
			message.toLowerCase().includes("session expired"))
	) {
		return true;
	}

	return false;
}

export function isNetworkError(error: unknown): boolean {
	if (!error) return false;

	const message = (getErrorMessage(error)?.toLowerCase() ?? "") as string;

	// Apollo network errors
	if (error instanceof Error) {
		if (
			message.includes("network") ||
			message.includes("timeout") ||
			message.includes("failed to fetch") ||
			message.includes("offline")
		) {
			return true;
		}
	}

	// Check for specific network properties
	if (typeof error === "object" && error !== null) {
		const err = error as Record<string, unknown>;
		if (
			err.networkError ||
			err.code === "ECONNREFUSED" ||
			err.code === "ETIMEDOUT" ||
			err.code === "ENOTFOUND"
		) {
			return true;
		}
	}

	return false;
}

export function isGraphQLError(error: unknown): boolean {
	if (!error) return false;

	// Check for GraphQL error structure
	if (typeof error === "object" && error !== null) {
		const err = error as Record<string, unknown>;
		if (err.graphQLErrors || (typeof err.message === "string" && err.message.includes("GraphQL"))) {
			return true;
		}
	}

	return false;
}

export function isParseError(error: unknown): boolean {
	if (!error) return false;

	const message = (getErrorMessage(error)?.toLowerCase() ?? "") as string;
	return message.includes("json") || message.includes("parse") || message.includes("syntax error");
}

export function isValidationError(error: unknown): boolean {
	if (!error) return false;

	const statusCode = getStatusCode(error);
	return statusCode === 400 || statusCode === 422;
}

export function isRetryableError(error: unknown): boolean {
	// Don't retry auth errors
	if (isAuthError(error)) {
		return false;
	}

	// Retry network errors
	if (isNetworkError(error)) {
		return true;
	}

	// Retry some server errors (5xx)
	const statusCode = getStatusCode(error);
	if (statusCode && statusCode >= 500) {
		return true;
	}

	// Don't retry validation or parse errors
	if (isValidationError(error) || isParseError(error)) {
		return false;
	}

	// GraphQL errors are generally not retryable
	if (isGraphQLError(error)) {
		return false;
	}

	return false;
}

export function extractErrorCode(error: unknown): string {
	if (!error) return "UNKNOWN_ERROR";

	if (typeof error === "object" && error !== null) {
		const err = error as Record<string, unknown>;

		// Check for code property
		if (typeof err.code === "string") {
			return err.code;
		}

		// Check for GraphQL error code
		if (Array.isArray(err.graphQLErrors) && err.graphQLErrors.length > 0) {
			const firstError = (err.graphQLErrors[0] as Record<string, unknown>) || {};
			if (typeof firstError.extensions === "object" && firstError.extensions) {
				const ext = firstError.extensions as Record<string, unknown>;
				if (typeof ext.code === "string") {
					return ext.code;
				}
			}
		}
	}

	const message = getErrorMessage(error);
	if (message) {
		return message.substring(0, 30).toUpperCase().replace(/\s+/g, "_");
	}

	return "UNKNOWN_ERROR";
}

export function getStatusCode(error: unknown): number | undefined {
	if (!error) return undefined;

	if (typeof error === "object" && error !== null) {
		const err = error as Record<string, unknown>;

		// Direct status property
		if (typeof err.status === "number") {
			return err.status;
		}

		// statusCode property
		if (typeof err.statusCode === "number") {
			return err.statusCode;
		}

		// GraphQL errors with status in extensions
		if (Array.isArray(err.graphQLErrors) && err.graphQLErrors.length > 0) {
			const firstError = (err.graphQLErrors[0] as Record<string, unknown>) || {};
			if (typeof firstError.extensions === "object" && firstError.extensions) {
				const ext = firstError.extensions as Record<string, unknown>;
				const http = ext.http as Record<string, unknown> | undefined;
				if (http && typeof http.status === "number") {
					return http.status;
				}
			}
		}

		// Response object
		if (typeof err.response === "object" && err.response) {
			const resp = err.response as Record<string, unknown>;
			if (typeof resp.status === "number") {
				return resp.status;
			}
		}
	}

	return undefined;
}

export function getErrorMessage(error: unknown): string | undefined {
	if (!error) return undefined;

	// Error instance
	if (error instanceof Error) {
		return error.message;
	}

	// String error
	if (typeof error === "string") {
		return error;
	}

	// Object with message
	if (typeof error === "object" && error !== null) {
		const err = error as Record<string, unknown>;

		if (typeof err.message === "string") {
			return err.message;
		}

		// GraphQL errors
		if (Array.isArray(err.graphQLErrors) && err.graphQLErrors.length > 0) {
			const firstError = err.graphQLErrors[0] as Record<string, unknown>;
			if (typeof firstError.message === "string") {
				return firstError.message;
			}
		}
	}

	return undefined;
}
