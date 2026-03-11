import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pipeline } from "node:stream/promises";

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

	const uploadsDir = subfolder
		? path.join(process.cwd(), "uploads", subfolder)
		: path.join(process.cwd(), "uploads");
	fs.mkdirSync(uploadsDir, { recursive: true });

	const storedName = `${crypto.randomUUID()}${extension}`;
	const filePath = path.join(uploadsDir, storedName);

	await pipeline(createReadStream(), fs.createWriteStream(filePath));

	return subfolder ? `/uploads/${subfolder}/${storedName}` : `/uploads/${storedName}`;
}
