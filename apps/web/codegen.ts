import type { CodegenConfig } from "@graphql-codegen/cli";
import { existsSync, readdirSync } from "fs";
import { dirname, resolve as resolvePath } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const getSchema = (): string | string[] => {
	if (process.env.GRAPHQL_SCHEMA_URL) {
		return process.env.GRAPHQL_SCHEMA_URL;
	}

	// Use source schema files from API to avoid duplication
	const apiSchemaDir = resolvePath(__dirname, "../api/src/schema");
	if (existsSync(apiSchemaDir)) {
		const schemaFiles = readdirSync(apiSchemaDir)
			.filter((file) => file.endsWith(".graphql"))
			.map((file) => resolvePath(apiSchemaDir, file));

		if (schemaFiles.length === 0) {
			throw new Error("No GraphQL schema files found in API schema directory");
		}

		return schemaFiles;
	}

	throw new Error("No GraphQL schema source found");
};

const config: CodegenConfig = {
	overwrite: true,
	schema: getSchema(),
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
