import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";

const httpLink = new HttpLink({
	uri: import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:4000/graphql",
});

const authLink = new ApolloLink((operation, forward) => {
	const token = localStorage.getItem("token");

	operation.setContext(({ headers = {} }) => ({
		headers: {
			...headers,
			...(token ? { authorization: `Bearer ${token}` } : {}),
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
