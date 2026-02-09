import express, { Express } from "express";
import cors from "cors";
import http from "http";
import path from "node:path";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import { typeDefs } from "./schema/index.js";
import { resolvers } from "./resolvers/index.js";

async function startServer() {
	const app: Express = express();
	const httpServer = http.createServer(app);

	// Create Apollo server
	const server = new ApolloServer({
		typeDefs,
		resolvers,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
	});

	app.use(cors());
	app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

	app.use("/graphql", graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 1 }));
	// Start Apollo server
	// Basic middleware
	app.use(express.json());
	await server.start();

	// Mount GraphQL endpoint
	app.use("/graphql", expressMiddleware(server));

	const port = Number(process.env.PORT) || 4000;
	await new Promise<void>((resolve) => httpServer.listen({ port, host: "0.0.0.0" }, resolve));
	console.log(`Server ready at http://localhost:${port}/graphql`);
}

startServer();
