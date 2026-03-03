import type { CodegenConfig } from "@graphql-codegen/cli";
import { existsSync } from "fs";
import { resolve as resolvePath } from "path";

const getSchema = (): string => {
	if (process.env.GRAPHQL_SCHEMA_URL) {
		return process.env.GRAPHQL_SCHEMA_URL;
	}

	const schemaPath = resolvePath(__dirname, "../api/schema.graphql");
	if (existsSync(schemaPath)) {
		return schemaPath;
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
