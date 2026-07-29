type DatabaseEnv = Record<string, string | undefined>;

const rdsKeys = [
	"RDS_HOSTNAME",
	"RDS_PORT",
	"RDS_DB_NAME",
	"RDS_USERNAME",
	"RDS_PASSWORD",
] as const;

function withRequiredSsl(url: string, env: DatabaseEnv): string {
	if (env.NODE_ENV !== "production" || url.includes("sslmode=")) {
		return url;
	}

	return `${url}${url.includes("?") ? "&" : "?"}sslmode=no-verify`;
}

export function getDatabaseUrl(env: DatabaseEnv = process.env): string {
	const databaseUrl = env.DATABASE_URL?.trim();

	// Elastic Beanstalk doesn't expand ${VAR} placeholders in environment property values.
	if (databaseUrl && !databaseUrl.includes("${")) {
		return withRequiredSsl(databaseUrl, env);
	}

	const missingKeys = rdsKeys.filter((key) => !env[key]);
	if (missingKeys.length > 0) {
		throw new Error(`Missing database configuration: ${missingKeys.join(", ")}`);
	}

	const user = encodeURIComponent(env.RDS_USERNAME!);
	const password = encodeURIComponent(env.RDS_PASSWORD!);
	const host = env.RDS_HOSTNAME!;
	const port = env.RDS_PORT!;
	const database = env.RDS_DB_NAME!;

	return withRequiredSsl(`postgresql://${user}:${password}@${host}:${port}/${database}`, env);
}
