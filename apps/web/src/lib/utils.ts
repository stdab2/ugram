import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Converts an image key/URL from the API to an absolute URL for the frontend.
 * In dev, falls back to the API server. In prod, uses VITE_MEDIA_BASE_URL (S3 / CloudFront).
 */
export function getImageUrl(imageUrl: string | null | undefined): string | undefined {
	if (!imageUrl) return undefined;
	// Already an absolute URL — return as-is
	if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
		return imageUrl;
	}
	const mediaBase =
		import.meta.env.VITE_MEDIA_BASE_URL ?? (import.meta.env.DEV ? "http://localhost:4001" : "");
	const normalised = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
	return `${mediaBase}${normalised}`;
}

export function timestampToDateString(timestamp: number): string {
	const date = new Date(timestamp);

	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}
