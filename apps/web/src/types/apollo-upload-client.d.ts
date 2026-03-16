declare module "apollo-upload-client/createUploadLink.mjs" {
	import { ApolloLink } from "@apollo/client";

	interface CreateUploadLinkOptions {
		uri?: string;
		fetch?: typeof fetch;
		headers?: Record<string, string>;
		credentials?: string;
		useGETForQueries?: boolean;
		includeExtensions?: boolean;
	}

	function createUploadLink(options: CreateUploadLinkOptions): ApolloLink;

	export default createUploadLink;
}
