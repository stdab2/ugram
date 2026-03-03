import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	overwrite: true,
	schema: process.env.GRAPHQL_SCHEMA_URL ?? "apps/api/schema.graphql",
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
