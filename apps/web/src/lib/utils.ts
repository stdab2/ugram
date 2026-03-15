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
 * Converts an image key/URL from the API to an absolute URL for the frontend.
 * In dev, falls back to the API server. In prod, uses VITE_MEDIA_BASE_URL (S3 / CloudFront).
 */
export function getImageUrl(imageUrl: string | null | undefined): string | undefined {
	if (!imageUrl) return undefined;

	// Keep already absolute/protocol-relative URLs as-is.
	if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(imageUrl) || imageUrl.startsWith("//")) {
		return imageUrl;
	}

	const normalizedPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
	const mediaBaseUrl = import.meta.env.VITE_MEDIA_BASE_URL?.replace(/\/+$/, "");
	if (mediaBaseUrl) {
		return `${mediaBaseUrl}${normalizedPath}`;
	}

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
