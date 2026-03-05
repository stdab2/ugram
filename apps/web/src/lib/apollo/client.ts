import { ApolloClient, InMemoryCache, ApolloLink } from "@apollo/client";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { createErrorLink } from "./errorLink";

const httpLink = createUploadLink({
	uri: import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:4001/graphql",
});

const authLink = new ApolloLink((operation, forward) => {
	const token = localStorage.getItem("token");

	operation.setContext(({ headers = {} }) => ({
		headers: {
			...headers,
			...(token ? { authorization: `Bearer ${token}` } : {}),
			"apollo-require-preflight": "true",
		},
	}));

	return forward(operation);
});

// Create error link for handling GraphQL and network errors
const errorLink = createErrorLink();

export const apolloClient = new ApolloClient({
	link: errorLink.concat(authLink).concat(httpLink),
	cache: new InMemoryCache(),
	defaultOptions: {
		watchQuery: {
			fetchPolicy: "cache-and-network",
		},
	},
});
