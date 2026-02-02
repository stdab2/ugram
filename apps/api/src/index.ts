import express, { Express } from "express";
import cors from "cors";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

const typeDefs = `#graphql
  type Query {
    hello: String
  }
`;

const resolvers = {
	Query: {
		hello: () => "Hello from GraphQL!",
	},
};

async function startServer() {
	const app: Express = express();
	const httpServer = http.createServer(app);

	// Create Apollo server
	const server = new ApolloServer({
		typeDefs,
		resolvers,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
	});

	// Start Apollo server
	await server.start();

	// Basic middleware
	app.use(cors());
	app.use(express.json());

	// Mount GraphQL endpoint
	app.use("/graphql", expressMiddleware(server));

	const port = Number(process.env.PORT) || 4000;
	await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
	console.log(`Server ready at http://localhost:${port}/graphql`);
}

startServer();
