const mediaBaseUrl = (import.meta as any).env?.VITE_MEDIA_BASE_URL as string | undefined;
const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Resolve an image path to a fully-qualified URL.
 *
 * Behavior:
 * - If `path` is falsy, returns null.
 * - If `path` is already an absolute http(s) URL, returns it unchanged.
 * - If `VITE_MEDIA_BASE_URL` is set, always uses it as the base for relative paths.
 * - If `VITE_MEDIA_BASE_URL` is NOT set and the path looks like an S3 key
 *   (e.g. starts with "uploads/"), throws an error to avoid generating a
 *   broken URL like `http://<api>/uploads/...`.
 * - Otherwise falls back to `VITE_API_BASE_URL` if available.
 */
export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) {
    return null;
  }

  // Already an absolute URL
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const trimmedPath = path.replace(/^\/+/, '');

  if (mediaBaseUrl) {
    return `${normalizeBaseUrl(mediaBaseUrl)}/${trimmedPath}`;
  }

  // Backend now returns S3 keys like "uploads/post/..." and no longer serves
  // /uploads statically. In that case, we must have VITE_MEDIA_BASE_URL set;
  // falling back to the API base URL would produce a 404.
  if (trimmedPath.startsWith('uploads/')) {
    throw new Error(
      `VITE_MEDIA_BASE_URL is required to resolve media key "${path}". ` +
        'The backend no longer serves /uploads statically, so configure ' +
        'VITE_MEDIA_BASE_URL to point at your media/S3 base URL.',
    );
  }

  if (apiBaseUrl) {
    return `${normalizeBaseUrl(apiBaseUrl)}/${trimmedPath}`;
  }

  throw new Error(
    `Unable to resolve image URL for "${path}": neither VITE_MEDIA_BASE_URL ` +
      'nor VITE_API_BASE_URL is configured.',
  );
}
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
