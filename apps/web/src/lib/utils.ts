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
 * Converts a media key/URL from the API to an absolute URL for the frontend.
 * In dev, falls back to the API server. In prod, uses VITE_MEDIA_BASE_URL (S3 / CloudFront).
 */
export function getImageUrl(mediaPath: string | null | undefined): string | undefined {
	if (!mediaPath) return undefined;

	// Keep already absolute/protocol-relative URLs as-is.
	if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(mediaPath) || mediaPath.startsWith("//")) {
		return mediaPath;
	}

	const normalizedPath = mediaPath.startsWith("/") ? mediaPath : `/${mediaPath}`;
	const mediaBaseUrl = import.meta.env.VITE_MEDIA_BASE_URL?.replace(/\/+$/, "");
	if (mediaBaseUrl) {
		return `${mediaBaseUrl}${normalizedPath}`;
	}

	return `${apiBaseUrl}${normalizedPath}`;
}

/**
 * Converts a data URL to a `File` so it can be sent to the backend.
 */
export function dataURLToFile(dataUrl: string, filename: string): File {
	const arr = dataUrl.split(",");
	const mimeMatch = arr[0].match(/:(.*?);/);

	if (!mimeMatch || !arr[1]) {
		throw new Error("Invalid data URL");
	}

	const mime = mimeMatch[1];
	const bstr = atob(arr[1]);
	let n = bstr.length;
	const u8arr = new Uint8Array(n);

	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}

	return new File([u8arr], filename, { type: mime });
}

export function timestampToDateString(timestamp: number): string {
	const date = new Date(timestamp);

	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}
