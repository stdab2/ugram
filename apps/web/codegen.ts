import type { CodegenConfig } from "@graphql-codegen/cli";

import { existsSync } from "fs";
import { resolve } from "path";

// Logs de débogage
console.log("=== CODEGEN DEBUG ===");
console.log("Current directory (__dirname):", __dirname);
console.log("process.cwd():", process.cwd());
console.log("GRAPHQL_SCHEMA_URL env:", process.env.GRAPHQL_SCHEMA_URL);

// Tester différents chemins
const paths = [
	"../api/schema.graphql",
	"../../apps/api/schema.graphql",
	resolve(__dirname, "../api/schema.graphql"),
	resolve(process.cwd(), "../api/schema.graphql"),
	resolve(process.cwd(), "apps/api/schema.graphql"),
];

console.log("\n=== TESTING PATHS ===");
paths.forEach((path) => {
	const exists = existsSync(path);
	console.log(`${exists ? "✅" : "❌"} ${path}`);
	if (exists) {
		console.log(`   → Resolved: ${resolve(path)}`);
	}
});

// Déterminer le schéma à utiliser
const getSchema = () => {
	if (process.env.GRAPHQL_SCHEMA_URL) {
		console.log("\n📡 Using GRAPHQL_SCHEMA_URL:", process.env.GRAPHQL_SCHEMA_URL);
		return process.env.GRAPHQL_SCHEMA_URL;
	}

	// Essayer plusieurs chemins
	const localPaths = [
		resolve(__dirname, "../api/schema.graphql"),
		resolve(process.cwd(), "../api/schema.graphql"),
		"../api/schema.graphql",
	];

	for (const path of localPaths) {
		if (existsSync(path)) {
			console.log("\n📄 Using local schema:", path);
			console.log("   → Absolute path:", resolve(path));
			return path;
		}
	}

	console.error("\n❌ No schema found!");
	throw new Error("No GraphQL schema source found");
};

const schema = getSchema();
console.log("\n🎯 Final schema:", schema);
console.log("===================\n");

const config: CodegenConfig = {
	overwrite: true,
	schema,
	documents: "src/**/*.graphql",
	generates: {
		"src/generated/graphql.tsx": {
			plugins: ["typescript", "typescript-operations", "typescript-react-apollo"],
			config: {
				withHooks: true,
				withHOC: false,
				withComponent: false,
				apolloReactHooksImportFrom: "@apollo/client",
				apolloReactCommonImportFrom: "@apollo/client",
				apolloClientVersion: 3,
				defaultScalarType: "unknown",
				avoidOptionals: {
					field: true,
					inputValue: false,
					object: false,
					defaultValue: false,
				},
				maybeValue: "T | null",
				inputMaybeValue: "T | null | undefined",
				skipTypename: false,
				nonOptionalTypename: true,
				preResolveTypes: true,
				useTypeImports: true,
				dedupeFragments: true,
			},
		},
	},
};

export default config;
