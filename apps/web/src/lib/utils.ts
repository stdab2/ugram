import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const DEFAULT_DEV_API_BASE_URL = "http://localhost:4001";
const DEFAULT_DEV_GRAPHQL_URL = `${DEFAULT_DEV_API_BASE_URL}/graphql`;

export function getGraphqlUrl(): string {
	const explicitGraphqlUrl = import.meta.env.VITE_GRAPHQL_URL?.trim();
	if (explicitGraphqlUrl) {
		return explicitGraphqlUrl;
	}

	if (import.meta.env.DEV) {
		return DEFAULT_DEV_GRAPHQL_URL;
	}

	return "/graphql";
}

export function getApiBaseUrl(): string {
	const explicitApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
	if (explicitApiBaseUrl) {
		return explicitApiBaseUrl.replace(/\/+$/, "");
	}

	const graphqlUrl = getGraphqlUrl();

	try {
		const parsedUrl = new URL(graphqlUrl, window.location.origin);
		return `${parsedUrl.protocol}//${parsedUrl.host}`;
	} catch {
		return import.meta.env.DEV ? DEFAULT_DEV_API_BASE_URL : window.location.origin;
	}
}

export function getApiOrigin(): string {
	try {
		return new URL(getApiBaseUrl(), window.location.origin).origin;
	} catch {
		return window.location.origin;
	}
}

export function getGoogleOAuthUrl(): string {
	return `${getApiBaseUrl()}/oauth2/google`;
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
