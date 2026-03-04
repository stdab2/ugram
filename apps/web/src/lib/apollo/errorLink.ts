import { onError } from "@apollo/client/link/error";
import { ApolloLink } from "@apollo/client";
import { logError, addErrorBreadcrumb } from "@/lib/error/errorLogger";
import { isAuthError, getErrorMessage } from "@/lib/error/errorClassifier";
import type { AppError, ErrorContext } from "@/types/error";

// This will be injected by the app
let getErrorContext: (() => ErrorContext) | null = null;
let notifyError: ((error: AppError) => void) | null = null;

/**
 * Set up error context getter (call from ErrorContext provider)
 */
export function setErrorContextGetter(getter: () => ErrorContext): void {
	getErrorContext = getter;
}

/**
 * Set up error notification (call from ErrorContext provider)
 */
export function setErrorNotifier(notifier: (error: AppError) => void): void {
	notifyError = notifier;
}

/**
 * Apollo error link for handling GraphQL and network errors
 */
export const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
	// Get current context
	const currentContext = getErrorContext?.() || {};
	const hasGraphQLErrors = Boolean(graphQLErrors && graphQLErrors.length > 0);

	// Handle GraphQL errors
	if (hasGraphQLErrors && graphQLErrors) {
		const primaryError = graphQLErrors[0];
		const message = primaryError.message || "GraphQL Error";
		const errorCode = (primaryError.extensions?.code as string) || "GRAPHQL_ERROR";

		// Check if it's an auth error (based on HTTP status and/or string error code)
		const statusCode = primaryError.extensions?.http?.status as number | undefined;
		const normalizedErrorCode = errorCode.toUpperCase();
		if (
			statusCode === 401 ||
			statusCode === 403 ||
			normalizedErrorCode === "UNAUTHENTICATED" ||
			normalizedErrorCode === "FORBIDDEN"
		) {
			handleAuthError(message, currentContext);
			return;
		}

		// Log first error only (avoid duplicate toasts for same operation)
		const appError = logError(primaryError, {
			...currentContext,
			action: `GraphQL: ${operation.operationName}`,
		});

		// Normalize common GraphQL validation error codes
		const validationCodes = ["BAD_USER_INPUT", "GRAPHQL_VALIDATION_FAILED"];
		const normalizedType = validationCodes.includes(errorCode) ? "VALIDATION" : appError.type;

		// Add breadcrumb with count for observability
		addErrorBreadcrumb(message, "graphql", {
			operationName: operation.operationName,
			errorCode,
			graphQLErrorCount: graphQLErrors.length,
		});

		// Notify error context once
		if (notifyError) {
			notifyError({
				...appError,
				type: normalizedType,
				code: errorCode || appError.code,
			});
		}
	}

	// Handle network errors
	if (networkError) {
		// Some GraphQL validation/parse failures can populate both graphQLErrors and networkError.
		// In that case, GraphQL branch already notified the user; skip second toast/log notification.
		if (hasGraphQLErrors) {
			addErrorBreadcrumb(
				`Skipped duplicate networkError notification for ${operation.operationName}`,
				"network",
				{
					operationName: operation.operationName,
					reason: "graphQLErrors_already_handled",
				}
			);
			return;
		}

		const isAuthErr = isAuthError(networkError);

		if (isAuthErr) {
			handleAuthError(getErrorMessage(networkError) || "Network error", currentContext);
			return;
		}

		// Log the network error
		const appError = logError(networkError, {
			...currentContext,
			action: `Network: ${operation.operationName}`,
		});

		// Add breadcrumb
		addErrorBreadcrumb(`Network error: ${getErrorMessage(networkError) || "Unknown"}`, "network", {
			operationName: operation.operationName,
			retryable: appError.retryable,
		});

		// Notify error context (auto-retry will be handled by ErrorContext)
		if (notifyError) {
			notifyError(appError);
		}
	}
});

/**
 * Handle authentication errors (401, 403)
 */
function handleAuthError(message: string, context: ErrorContext): void {
	// Log the auth error
	const appError = logError(new Error(message), {
		...context,
		action: "Auth Error",
	});

	// Add breadcrumb
	addErrorBreadcrumb("Authentication error - redirecting to login", "auth");

	// Notify error context with auth-specific handling
	if (notifyError) {
		notifyError({
			...appError,
			type: "AUTH",
			code: "UNAUTHORIZED",
			message: "Session expired. Please login again.",
			severity: "error",
		});
	}

	// Clear auth token and redirect
	clearAuthAndRedirect();
}

/**
 * Clear auth token and redirect to login
 */
function clearAuthAndRedirect(): void {
	// Clear localStorage
	localStorage.removeItem("authToken");
	localStorage.removeItem("refreshToken");

	// Clear sessionStorage
	sessionStorage.removeItem("authToken");
	sessionStorage.removeItem("refreshToken");

	// Redirect after a short delay to allow toast to display
	setTimeout(() => {
		window.location.href = "/login";
	}, 2000);
}

/**
 * Create a wrapper for the error link that allows dependency injection
 */
export const createErrorLink = (): ApolloLink => {
	return errorLink;
};
