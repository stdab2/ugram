import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");
const sourceDir = path.join(appRoot, "src", "schema");
const targetDir = path.join(appRoot, "dist", "schema");

await fs.mkdir(targetDir, { recursive: true });

for (const entry of await fs.readdir(sourceDir, { withFileTypes: true })) {
	if (!entry.isFile() || !entry.name.endsWith(".graphql")) {
		continue;
	}

	await fs.copyFile(path.join(sourceDir, entry.name), path.join(targetDir, entry.name));
}
