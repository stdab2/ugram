import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Converts a relative image URL from the API to an absolute URL for the frontend
 * @param imageUrl - The relative image URL from the API (e.g., "images/post/1.jpg")
 * @returns The absolute URL (e.g., "/images/post/1.jpg")
 */
export function getImageUrl(imageUrl: string | null | undefined): string | undefined {
	if (!imageUrl) return undefined;
	// If the URL already starts with /, http:// or https://, return as is
	if (
		imageUrl.startsWith("/") ||
		imageUrl.startsWith("http://") ||
		imageUrl.startsWith("https://")
	) {
		return "http://localhost:4001" + imageUrl;
	}
	// Otherwise, prepend / to make it relative to the public folder
	return "http://localhost:4001" + `/${imageUrl}`;
}

export function timestampToDateString(timestamp: number): string {
	const date = new Date(timestamp);

	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}
