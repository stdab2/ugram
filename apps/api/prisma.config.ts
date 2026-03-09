import path from "node:path";
import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, ".env.local") });

export default defineConfig({
	schema: path.join("prisma", "schema.prisma"),
	migrations: {
		seed: "tsx prisma/seed.ts",
	},
	datasource: { url: process.env.DATABASE_URL },
});
