import { useState, useCallback } from "react";
import type { AppError, ErrorContext } from "@/types/error";
import { useErrorContext } from "@/contexts/ErrorContext";
import { logError } from "@/lib/error/errorLogger";

interface UseErrorReturn {
	error: AppError | null;
	setError: (error: AppError | null) => void;
	clearError: () => void;
	logError: (message: string, type?: AppError["type"], shouldToast?: boolean) => AppError;
}

/**
 * Hook for managing errors in components
 */
export const useError = (): UseErrorReturn => {
	const [error, setError] = useState<AppError | null>(null);
	const { addError } = useErrorContext();

	const handleLogError = useCallback(
		(message: string, _type?: AppError["type"], shouldToast = true): AppError => {
			const err = new Error(message);
			const context: ErrorContext = {
				timestamp: Date.now(),
			};

			const appError = logError(err, context);

			// Update local state
			setError(appError);

			// Show toast if requested
			if (shouldToast) {
				addError(appError);
			}

			return appError;
		},
		[addError]
	);

	const handleClearError = useCallback(() => {
		setError(null);
	}, []);

	return {
		error,
		setError,
		clearError: handleClearError,
		logError: handleLogError,
	};
};
