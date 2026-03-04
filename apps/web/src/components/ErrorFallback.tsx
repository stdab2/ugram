import React from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorFallbackProps {
	error: Error;
	onReset: () => void;
}

/**
 * Fallback UI component for ErrorBoundary
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
	const isDev = import.meta.env.DEV;

	return (
		<div className="flex items-center justify-center min-h-screen bg-background">
			<div className="max-w-md w-full mx-auto p-6">
				{/* Error Icon */}
				<div className="flex justify-center mb-6">
					<div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
						<AlertTriangle className="w-8 h-8 text-destructive" />
					</div>
				</div>

				{/* Title */}
				<h1 className="text-2xl font-bold text-center mb-3 text-foreground">
					Something went wrong
				</h1>

				{/* Description */}
				<p className="text-center text-muted-foreground mb-6">
					We encountered an unexpected error. Please try refreshing the page or contact support if
					the problem persists.
				</p>

				{/* Error Message (Dev Only) */}
				{isDev && (
					<div className="mb-6 p-4 bg-muted rounded-lg border border-border">
						<p className="text-xs font-mono text-muted-foreground break-words">
							{error.message || "Unknown error"}
						</p>
						{error.stack && (
							<details className="mt-2">
								<summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
									Stack trace
								</summary>
								<pre className="text-xs text-muted-foreground overflow-auto max-h-48 mt-2 bg-background p-2 rounded border border-border">
									{error.stack}
								</pre>
							</details>
						)}
					</div>
				)}

				{/* Action Buttons */}
				<div className="flex gap-3">
					<button
						onClick={onReset}
						className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
					>
						Try again
					</button>

					<button
						onClick={() => (window.location.href = "/")}
						className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
					>
						Go home
					</button>
				</div>

				{/* Help Text */}
				<p className="text-center text-xs text-muted-foreground mt-6">
					Error type: {error.name || "UNKNOWN"}
				</p>
			</div>
		</div>
	);
};

export default ErrorFallback;
