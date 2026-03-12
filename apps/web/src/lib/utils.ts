import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

function getApiBaseUrl(): string {
	const explicitApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
	if (explicitApiBaseUrl) {
		return explicitApiBaseUrl.replace(/\/+$/, "");
	}

	const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:4001/graphql";

	try {
		const parsedUrl = new URL(graphqlUrl);
		return `${parsedUrl.protocol}//${parsedUrl.host}`;
	} catch {
		return "http://localhost:4001";
	}
}

const apiBaseUrl = getApiBaseUrl();

/**
 * Converts a relative image URL from the API to an absolute URL for the frontend
 * @param imageUrl - The relative image URL from the API (e.g., "images/post/1.jpg")
 * @returns The absolute URL (e.g., "/images/post/1.jpg")
 */
export function getImageUrl(imageUrl: string | null | undefined): string | undefined {
	if (!imageUrl) return undefined;

	// Keep already absolute/protocol-relative URLs as-is.
	if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(imageUrl) || imageUrl.startsWith("//")) {
		return imageUrl;
	}

	const normalizedPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
	return `${apiBaseUrl}${normalizedPath}`;
}

export function timestampToDateString(timestamp: number): string {
	const date = new Date(timestamp);

	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}
