import path from "node:path";
import { defineConfig } from "prisma/config";
import "dotenv/config";
import { getDatabaseUrl } from "./database-url.js";

export default defineConfig({
	schema: path.join("prisma", "schema.prisma"),
	migrations: {
		seed: "tsx prisma/seed.ts",
	},
	datasource: { url: getDatabaseUrl() },
});
