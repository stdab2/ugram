import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
	region: process.env.AWS_REGION ?? "ca-central-1",
	...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
		? {
				credentials: {
					accessKeyId: process.env.AWS_ACCESS_KEY_ID,
					secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
				},
			}
		: {}),
});

const BUCKET = process.env.S3_BUCKET ?? "ugram-media-s3";
const currentFilePath = fileURLToPath(import.meta.url);
const localUploadsDir = path.resolve(path.dirname(currentFilePath), "../../uploads");

function shouldUseLocalUploads() {
	if (process.env.USE_LOCAL_UPLOADS === "true") {
		return true;
	}

	if (process.env.USE_LOCAL_UPLOADS === "false") {
		return false;
	}

	return (process.env.NODE_ENV ?? "development") === "development";
}

export function getLocalUploadsDir() {
	return localUploadsDir;
}

export function isUsingLocalUploads() {
	return shouldUseLocalUploads();
}

function toLocalFilePath(imageUrlOrKey: string): string {
	const key = toS3Key(imageUrlOrKey);
	const normalizedKey = key.startsWith("uploads/") ? key.slice("uploads/".length) : key;
	return path.join(localUploadsDir, normalizedKey);
}

function toS3Key(imageUrlOrKey: string): string {
	if (imageUrlOrKey.startsWith("http://") || imageUrlOrKey.startsWith("https://")) {
		const parsed = new URL(imageUrlOrKey);
		return parsed.pathname.replace(/^\/+/, "");
	}

	return imageUrlOrKey.replace(/^\/+/, "");
}

export async function saveUploadedImage(
	upload: Promise<{
		filename: string;
		mimetype: string;
		createReadStream: () => NodeJS.ReadableStream;
	}>,
	subfolder: string = ""
): Promise<{ imageKey: string }> {
	const { filename, mimetype, createReadStream } = await upload;

	const allowedExt = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
	const extension = path.extname(filename ?? "").toLowerCase();

	if (!(mimetype?.startsWith("image/") || mimetype === "application/octet-stream")) {
		throw new Error(`Unsupported mimetype: ${mimetype}`);
	}

	if (!allowedExt.has(extension)) {
		throw new Error(`Unsupported file extension: ${extension}`);
	}

	const imageKey = crypto.randomUUID();
	const storedName = `${imageKey}${extension}`;
	const key = subfolder ? `uploads/${subfolder}/${storedName}` : `uploads/${storedName}`;

	const stream = createReadStream();
	const chunks: Buffer[] = [];
	for await (const chunk of stream) {
		chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
	}
	const body = Buffer.concat(chunks);

	if (shouldUseLocalUploads()) {
		const localFilePath = toLocalFilePath(key);
		await fs.mkdir(path.dirname(localFilePath), { recursive: true });
		await fs.writeFile(localFilePath, body);
		return key;
	}

	await s3.send(
		new PutObjectCommand({
			Bucket: BUCKET,
			Key: key,
			Body: body,
			ContentType: mimetype,
		})
	);

	return { imageKey };
}

export async function deleteImageFromStorage(
	imageUrlOrKey: string | null | undefined
): Promise<void> {
	if (!imageUrlOrKey) return;

	if (shouldUseLocalUploads()) {
		const localFilePath = toLocalFilePath(imageUrlOrKey);

		try {
			await fs.unlink(localFilePath);
		} catch (error: unknown) {
			const isFileMissing =
				error &&
				typeof error === "object" &&
				"code" in error &&
				(error as { code?: string }).code === "ENOENT";

			if (!isFileMissing) {
				throw error;
			}
		}

		return;
	}

	const key = toS3Key(imageUrlOrKey);
	if (!key) return;

	await s3.send(
		new DeleteObjectCommand({
			Bucket: BUCKET,
			Key: key,
		})
	);
}
