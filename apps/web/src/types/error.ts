/**
 * Error type definitions for the application
 */

export type ErrorType = "GRAPHQL" | "NETWORK" | "AUTH" | "PARSE" | "VALIDATION" | "UNKNOWN";
export type LogSeverity = "debug" | "info" | "warning" | "error" | "fatal";

export interface ErrorContext {
	route?: string;
	action?: string;
	state?: Record<string, unknown>;
	userId?: string;
	timestamp?: number;
}

export interface AppError {
	type: ErrorType;
	code: string;
	message: string;
	statusCode?: number;
	originalError?: Error | unknown;
	context?: ErrorContext;
	retryable: boolean;
	id: string;
	severity: LogSeverity;
}

export interface RetryConfig {
	maxRetries: number;
	initialDelay: number;
	maxDelay: number;
	backoffMultiplier: number;
}

export interface AppErrorWithToast extends AppError {
	shouldShowToast: boolean;
	action?: {
		label: string;
		onClick: () => void | Promise<void>;
	};
}
