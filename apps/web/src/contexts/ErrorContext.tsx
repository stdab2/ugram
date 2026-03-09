import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useLayoutEffect,
	useRef,
	type ReactNode,
} from "react";
import { toast } from "sonner";
import type { AppError, AppErrorWithToast } from "@/types/error";
import { getUserFriendlyMessage } from "@/lib/error/errorMessages";
import { setErrorContextGetter, setErrorNotifier } from "@/lib/apollo/errorLink";

interface ErrorContextValue {
	errors: AppError[];
	addError: (error: AppError) => void;
	removeError: (id: string) => void;
	clearErrors: () => void;
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

/**
 * Error Provider Component
 */
export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [errors, setErrors] = useState<AppError[]>([]);
	const recentErrorsRef = useRef<Map<string, number>>(new Map());

	const isDuplicateError = useCallback((error: AppError): boolean => {
		const now = Date.now();
		const route = error.context?.route || "";
		const key = `${error.type}|${error.code}|${error.message}|${route}`;

		// cleanup stale entries
		for (const [entryKey, timestamp] of recentErrorsRef.current.entries()) {
			if (now - timestamp > 5000) {
				recentErrorsRef.current.delete(entryKey);
			}
		}

		const previousTimestamp = recentErrorsRef.current.get(key);
		if (previousTimestamp && now - previousTimestamp < 1500) {
			return true;
		}

		recentErrorsRef.current.set(key, now);
		return false;
	}, []);

	/**
	 * Remove error from state
	 */
	const removeError = useCallback((id: string) => {
		setErrors((prev) => prev.filter((err) => err.id !== id));
	}, []);

	// Set up error context getter for Apollo errorLink (synchronous to avoid race conditions)
	useLayoutEffect(() => {
		setErrorContextGetter(() => ({
			route: window.location.pathname,
			timestamp: Date.now(),
		}));
	}, []);

	/**
	 * Add error to state and show toast
	 */
	const addError = useCallback(
		(error: AppError) => {
			if (isDuplicateError(error)) {
				return;
			}

			setErrors((prev) => {
				// Keep max 5 errors
				const updated = [error, ...prev].slice(0, 5);
				return updated;
			});

			// Show toast notification
			showErrorToast(error);

			// Auto-remove error after 5 seconds (unless it's persistent)
			const shouldPersist =
				(error.severity === "error" || error.severity === "fatal") && error.type === "AUTH";
			if (!shouldPersist) {
				setTimeout(() => {
					removeError(error.id);
				}, 5000);
			}
		},
		[isDuplicateError, removeError]
	);

	/**
	 * Clear all errors
	 */
	const clearErrors = useCallback(() => {
		setErrors([]);
	}, []);

	// Set up error notifier for Apollo errorLink (synchronous to avoid race conditions)
	useLayoutEffect(() => {
		setErrorNotifier((error: AppError) => {
			addError(error);
		});
	}, [addError]);

	const value: ErrorContextValue = {
		errors,
		addError,
		removeError,
		clearErrors,
	};

	return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
};

/**
 * Hook to use error context
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useErrorContext = (): ErrorContextValue => {
	const context = useContext(ErrorContext);
	if (!context) {
		throw new Error("useErrorContext must be used within ErrorProvider");
	}
	return context;
};

/**
 * Show error toast with user-friendly message
 */
function showErrorToast(error: AppError): void {
	const message = getUserFriendlyMessage(error);
	const toastId = error.id;
	const isNetworkLike =
		error.type === "NETWORK" ||
		error.code === "NETWORK_ERROR" ||
		error.message.toLowerCase().includes("failed to fetch") ||
		error.message.toLowerCase().includes("network");

	// Check if this error has a custom retry action
	const errorWithAction = error as AppErrorWithToast;
	const hasCustomAction = errorWithAction.action;

	// For network errors that are retryable, show auto-retry countdown
	if (isNetworkLike && error.retryable && !hasCustomAction) {
		let countdown = 5; // 5 seconds before auto-retry
		let countdownInterval: ReturnType<typeof setInterval> = 0 as unknown as ReturnType<
			typeof setInterval
		>;

		const cancelCountdown = () => {
			clearInterval(countdownInterval);
		};

		// Show initial toast with countdown
		toast.warning(message, {
			id: toastId,
			duration: Infinity,
			description: `Retrying automatically in ${countdown} seconds...`,
			closeButton: true,
			onDismiss: cancelCountdown,
			onAutoClose: cancelCountdown,
		});

		// Update countdown every second
		countdownInterval = setInterval(() => {
			countdown--;

			if (countdown > 0) {
				toast.warning(message, {
					id: toastId,
					duration: Infinity,
					description: `Retrying automatically in ${countdown} second${countdown > 1 ? "s" : ""}...`,
					closeButton: true,
					onDismiss: cancelCountdown,
					onAutoClose: cancelCountdown,
				});
			} else {
				clearInterval(countdownInterval);

				// Show reloading message
				toast.loading("Retrying...", {
					id: toastId,
					duration: 2000,
				});

				// Reload the page after a short delay
				setTimeout(() => {
					window.location.reload();
				}, 500);
			}
		}, 1000);

		return;
	}

	// For errors with custom actions (like the test page), use the action
	if (hasCustomAction && errorWithAction.action) {
		const actionConfig = errorWithAction.action;

		switch (error.type) {
			case "NETWORK":
				toast.warning(message, {
					id: toastId,
					duration: Infinity,
					description: "Check your internet connection",
					closeButton: true,
					action: {
						label: actionConfig.label,
						onClick: () => {
							actionConfig.onClick();
							toast.dismiss(toastId);
						},
					},
				});
				break;

			default:
				toast.error(message, {
					id: toastId,
					duration: 5000,
					closeButton: true,
					action: {
						label: actionConfig.label,
						onClick: () => {
							actionConfig.onClick();
							toast.dismiss(toastId);
						},
					},
				});
		}
		return;
	}

	// For all other errors, show simple toast without action
	switch (error.type) {
		case "AUTH":
			toast.error(message, {
				id: toastId,
				duration: 5000,
				description: "Authentication required",
				closeButton: true,
			});
			break;

		case "NETWORK":
			toast.warning(message, {
				id: toastId,
				duration: 5000,
				description: "Check your internet connection",
				closeButton: true,
			});
			break;

		case "VALIDATION":
			toast.error(message, {
				id: toastId,
				duration: 4000,
				description: "Please check your input",
				closeButton: true,
			});
			break;

		case "GRAPHQL":
			toast.error(message, {
				id: toastId,
				duration: 5000,
				description: "Server error occurred",
				closeButton: true,
			});
			break;

		case "PARSE":
			toast.error(message, {
				id: toastId,
				duration: 4000,
				description: "Data parsing failed",
				closeButton: true,
			});
			break;

		default:
			toast.error(message, {
				id: toastId,
				duration: 5000,
				closeButton: true,
			});
	}
}
