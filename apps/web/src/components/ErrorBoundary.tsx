import React, { type ErrorInfo, type ReactNode } from "react";
import * as Sentry from "@sentry/react";
import { logError } from "@/lib/error/errorLogger";
import ErrorFallback from "@/components/ErrorFallback";

interface Props {
	children: ReactNode;
	fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

/**
 * Error Boundary Component
 * Catches errors in the component tree and displays fallback UI
 */
class ErrorBoundary extends React.Component<Props, State> {
	public constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		// Log error to Sentry
		Sentry.captureException(error, {
			contexts: {
				react: {
					componentStack: errorInfo.componentStack,
				},
			},
			level: "error",
			tags: {
				error_source: "ErrorBoundary",
			},
		});

		// Log to our error logger
		logError(error, {
			action: "React Render Error",
			state: {
				componentStack: errorInfo.componentStack,
			},
		});

		// Log to console in dev
		if (import.meta.env.DEV) {
			console.error("ErrorBoundary caught an error:", error);
			console.error("Component Stack:", errorInfo.componentStack);
		}
	}

	private handleReset = (): void => {
		this.setState({ hasError: false, error: null });
	};

	public render(): ReactNode {
		if (this.state.hasError && this.state.error) {
			// Use custom fallback if provided
			if (this.props.fallback) {
				return this.props.fallback(this.state.error, this.handleReset);
			}

			// Use default fallback
			return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
