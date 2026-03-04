import * as Sentry from "@sentry/react";
import type { AppError, ErrorContext, LogSeverity } from "@/types/error";
import { classifyError, extractErrorCode, getStatusCode, getErrorMessage } from "./errorClassifier";

/**
 * Structured error logger with Sentry integration
 */
export class ErrorLogger {
	private isDev = import.meta.env.DEV;
	private logQueue: AppError[] = [];
	private batchTimeout: ReturnType<typeof setTimeout> | null = null;

	/**
	 * Main logging function
	 */
	logError(error: unknown, context?: ErrorContext, severity: LogSeverity = "error"): AppError {
		const appError = this.parseError(error, context, severity);
		this.queueLog(appError);
		return appError;
	}

	/**
	 * Parse error into structured AppError format
	 */
	private parseError(
		error: unknown,
		context?: ErrorContext,
		severity: LogSeverity = "error"
	): AppError {
		const errorType = classifyError(error);
		const code = extractErrorCode(error);
		const statusCode = getStatusCode(error);
		const message = getErrorMessage(error) || "Unknown error";

		const appError: AppError = {
			type: errorType,
			code,
			message,
			statusCode,
			originalError: error instanceof Error ? error : undefined,
			context: {
				...context,
				timestamp: Date.now(),
			},
			retryable: this.isRetryable(error),
			id: this.generateErrorId(),
			severity,
		};

		return appError;
	}

	/**
	 * Determine if error is retryable
	 */
	private isRetryable(error: unknown): boolean {
		const statusCode = getStatusCode(error);

		// Retry 5xx server errors
		if (statusCode && statusCode >= 500) {
			return true;
		}

		// Retry network errors
		const message = getErrorMessage(error)?.toLowerCase() ?? "";
		return (
			message.includes("network") ||
			message.includes("timeout") ||
			message.includes("failed to fetch") ||
			message.includes("econnrefused") ||
			message.includes("offline")
		);
	}

	/**
	 * Queue error for batched logging
	 */
	private queueLog(appError: AppError): void {
		this.logQueue.push(appError);

		// Log immediately if dev mode
		if (this.isDev) {
			this.logToConsole(appError);
		}

		// Batch log to Sentry
		if (this.batchTimeout) {
			clearTimeout(this.batchTimeout);
		}

		this.batchTimeout = setTimeout(() => {
			this.flushLogs();
		}, 100);
	}

	/**
	 * Flush queued logs to Sentry
	 */
	private flushLogs(): void {
		if (this.logQueue.length === 0) return;

		// Process first error from queue
		const appError = this.logQueue.shift();
		if (appError) {
			this.logToSentry(appError);
		}

		// Continue if more errors in queue
		if (this.logQueue.length > 0) {
			this.batchTimeout = setTimeout(() => {
				this.flushLogs();
			}, 100);
		}
	}

	/**
	 * Log error to Sentry
	 */
	private logToSentry(appError: AppError): void {
		// Add breadcrumb
		Sentry.addBreadcrumb({
			category: "error",
			level: this.severityToSentryLevel(appError.severity),
			message: appError.message,
			data: {
				code: appError.code,
				statusCode: appError.statusCode,
				type: appError.type,
			},
		});

		// Capture exception with scoped tags/user/context
		Sentry.withScope((scope) => {
			scope.setTag("error_type", appError.type);
			scope.setTag("error_code", appError.code);
			scope.setTag("retryable", String(appError.retryable));

			if (appError.context?.route) {
				scope.setTag("route", appError.context.route);
			}
			if (appError.context?.action) {
				scope.setTag("action", appError.context.action);
			}
			if (appError.context?.userId) {
				scope.setUser({ id: appError.context.userId });
			}
			if (appError.context?.state) {
				scope.setContext("appState", appError.context.state);
			}

			const exception = appError.originalError || new Error(appError.message);
			Sentry.captureException(exception, {
				level: this.severityToSentryLevel(appError.severity),
			});
		});
	}

	/**
	 * Log error to console (dev mode) using browser-compatible styling
	 */
	private logToConsole(appError: AppError): void {
		const colorMap: Record<string, string> = {
			debug: "color: #0ea5e9",
			info: "color: #22c55e",
			warning: "color: #f59e0b",
			error: "color: #ef4444",
			fatal: "color: #a855f7",
		};

		const style = colorMap[appError.severity] ?? colorMap.error;
		const tag = `[${appError.severity.toUpperCase()}]`;

		console.group(`%c${tag} ${appError.type}`, style);
		console.log(`Code: ${appError.code}`);
		console.log(`Message: ${appError.message}`);
		if (appError.statusCode) {
			console.log(`Status: ${appError.statusCode}`);
		}
		if (appError.context) {
			console.log("Context:", appError.context);
		}
		if (appError.originalError) {
			console.log("Original Error:", appError.originalError);
		}
		console.groupEnd();
	}

	/**
	 * Convert severity to Sentry level
	 */
	private severityToSentryLevel(severity: LogSeverity): Sentry.SeverityLevel {
		const levelMap: Record<LogSeverity, Sentry.SeverityLevel> = {
			debug: "debug",
			info: "info",
			warning: "warning",
			error: "error",
			fatal: "fatal",
		};
		return levelMap[severity] || "error";
	}

	/**
	 * Generate unique error ID
	 */
	private generateErrorId(): string {
		return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
}

// Create singleton instance
export const errorLogger = new ErrorLogger();

/**
 * Log error helper function
 */
export function logError(
	error: unknown,
	context?: ErrorContext,
	severity: LogSeverity = "error"
): AppError {
	return errorLogger.logError(error, context, severity);
}

/**
 * Add breadcrumb for tracking
 */
export function addErrorBreadcrumb(
	message: string,
	category: string = "custom",
	data?: Record<string, unknown>
): void {
	Sentry.addBreadcrumb({
		message,
		category,
		level: "info",
		data,
	});
}
