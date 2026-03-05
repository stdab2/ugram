import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { RetryConfig } from "@/types/error";
import { addErrorBreadcrumb } from "@/lib/error/errorLogger";

interface UseRetryReturn {
	retry: <T>(fn: () => Promise<T>) => Promise<T | null>;
	isRetrying: boolean;
	retryCount: number;
	resetCount: () => void;
	retryWithToast: <T>(fn: () => Promise<T>, errorMsg: string) => Promise<T | null>;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
	maxRetries: 3,
	initialDelay: 1000,
	maxDelay: 10000,
	backoffMultiplier: 2,
};

/**
 * Hook for handling retry logic with exponential backoff
 */
export const useRetry = (config?: Partial<RetryConfig>): UseRetryReturn => {
	const [isRetrying, setIsRetrying] = useState(false);
	const [retryCount, setRetryCount] = useState(0);
	const configRef = useRef<RetryConfig>({ ...DEFAULT_RETRY_CONFIG, ...config });

	/**
	 * Calculate delay with exponential backoff
	 */
	const calculateDelay = useCallback((attempt: number): number => {
		const { initialDelay, maxDelay, backoffMultiplier } = configRef.current;
		const delay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
		return Math.min(delay, maxDelay);
	}, []);

	/**
	 * Sleep helper
	 */
	const sleep = useCallback((ms: number): Promise<void> => {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}, []);

	/**
	 * Main retry function
	 */
	const retry = useCallback(
		async <T>(fn: () => Promise<T>): Promise<T | null> => {
			const { maxRetries } = configRef.current;
			let lastError: Error | null = null;

			for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
				try {
					setIsRetrying(true);
					const result = await fn();
					setIsRetrying(false);
					setRetryCount(0);
					return result;
				} catch (error) {
					lastError = error instanceof Error ? error : new Error(String(error));

					if (attempt < maxRetries + 1) {
						const delay = calculateDelay(attempt);
						setRetryCount(attempt);

						// Log retry attempt
						addErrorBreadcrumb(`Retry attempt ${attempt}/${maxRetries}`, "retry", {
							delay,
							error: lastError.message,
						});

						await sleep(delay);
					}
				}
			}

			setIsRetrying(false);
			setRetryCount(0);

			// Log final failure
			addErrorBreadcrumb(`All ${maxRetries} retry attempts failed`, "retry", {
				finalError: lastError?.message,
			});

			return null;
		},
		[calculateDelay, sleep]
	);

	/**
	 * Retry with toast notification on failure
	 */
	const retryWithToast = useCallback(
		async <T>(fn: () => Promise<T>, errorMsg: string): Promise<T | null> => {
			const result = await retry(fn);

			if (result === null) {
				toast.error(errorMsg, {
					duration: 5000,
					closeButton: true,
				});
			}

			return result;
		},
		[retry]
	);

	/**
	 * Reset retry count
	 */
	const resetCount = useCallback(() => {
		setRetryCount(0);
	}, []);

	return {
		retry,
		isRetrying,
		retryCount,
		resetCount,
		retryWithToast,
	};
};
