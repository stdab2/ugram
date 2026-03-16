declare module "graphql-upload/graphqlUploadExpress.mjs" {
	import { RequestHandler } from "express";

	export interface GraphQLUploadExpressOptions {
		maxFileSize?: number;
		maxFiles?: number;
	}

	export default function graphqlUploadExpress(
		options?: GraphQLUploadExpressOptions
	): RequestHandler;
}

declare module "graphql-upload/GraphQLUpload.mjs" {
	import { GraphQLScalarType } from "graphql";
	const GraphQLUpload: GraphQLScalarType;
	export default GraphQLUpload;
}

declare module "graphql-upload" {
	import { GraphQLScalarType } from "graphql";
	import { RequestHandler } from "express";

	export interface FileUpload {
		filename: string;
		mimetype: string;
		encoding: string;
		createReadStream: () => NodeJS.ReadableStream;
	}

	export interface GraphQLUploadExpressOptions {
		maxFileSize?: number;
		maxFiles?: number;
	}

	export const GraphQLUpload: GraphQLScalarType;
	export default function graphqlUploadExpress(
		options?: GraphQLUploadExpressOptions
	): RequestHandler;
}
