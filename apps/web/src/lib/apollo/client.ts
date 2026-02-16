import { ApolloClient, InMemoryCache, ApolloLink } from "@apollo/client";
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";

const httpLink = new UploadHttpLink({
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

export const apolloClient = new ApolloClient({
	link: authLink.concat(httpLink),
	cache: new InMemoryCache(),
	defaultOptions: {
		watchQuery: {
			fetchPolicy: "cache-and-network",
		},
	},
});
