import { GraphQLScalarType, Kind, ValueNode } from "graphql";
import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";

export const scalars = {
	Upload: GraphQLUpload,
};

export const DateTimeScalar = new GraphQLScalarType({
	name: "DateTime",
	description: "DateTime custom scalar type",

	// Serialize: Convert Date object to ISO string for the client
	serialize(value: unknown) {
		if (value instanceof Date) {
			return value.toISOString();
		}
		throw Error("GraphQL DateTime Scalar serializer expected a `Date` object");
	},

	// Parse value from query variables
	parseValue(value: unknown) {
		if (typeof value === "string") {
			const date = new Date(value);
			if (!isNaN(date.getTime())) {
				return date;
			}
		}
		throw new Error("GraphQL DateTime Scalar parser expected a valid date string");
	},

	// Parse literal value in query
	parseLiteral(ast: ValueNode) {
		if (ast.kind === Kind.STRING) {
			const date = new Date(ast.value);
			if (!isNaN(date.getTime())) {
				return date;
			}
		}
		throw new Error("GraphQL DateTime Scalar parser expected a valid date string");
	},
});
