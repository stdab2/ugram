import path from "node:path";
import crypto from "node:crypto";
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
): Promise<string> {
	const { filename, mimetype, createReadStream } = await upload;

	const allowedExt = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
	const extension = path.extname(filename ?? "").toLowerCase();

	if (!(mimetype?.startsWith("image/") || mimetype === "application/octet-stream")) {
		throw new Error(`Unsupported mimetype: ${mimetype}`);
	}

	if (!allowedExt.has(extension)) {
		throw new Error(`Unsupported file extension: ${extension}`);
	}

	const storedName = `${crypto.randomUUID()}${extension}`;
	const key = subfolder ? `uploads/${subfolder}/${storedName}` : `uploads/${storedName}`;

	const stream = createReadStream();
			Body: stream,
			ContentType: mimetype,
		})
	);

			Body: stream,
}

export async function deleteImageFromStorage(
	imageUrlOrKey: string | null | undefined
): Promise<void> {
	if (!imageUrlOrKey) return;

	const key = toS3Key(imageUrlOrKey);
	if (!key) return;

	await s3.send(
		new DeleteObjectCommand({
			Bucket: BUCKET,
			Key: key,
		})
	);
}
