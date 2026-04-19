import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { getDatabaseUrl } from "../database-url.js";
import "dotenv/config";

const adapter = new PrismaPg({
	connectionString: getDatabaseUrl(),
});

export const prisma = new PrismaClient({
	adapter,
});
