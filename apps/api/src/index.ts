import "dotenv/config";
import "../instrument.js";
import * as Sentry from "@sentry/node";
import { ValidationError } from "../Validators/errors.js";
import { GraphQLError } from "graphql";
import express, { Express } from "express";
import cors from "cors";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import { typeDefs } from "./schema/index.js";
import { resolvers } from "./resolvers/index.js";
import "dotenv/config";
import { verifyToken } from "./services/jwt.service.js";
import cookieParser from "cookie-parser";
import oauthRouter from "./routes/oauth.route.js";
import authRouter from "./routes/auth.route.js";
import { getLocalUploadsDir, isUsingLocalUploads } from "./services/image.service.js";
async function startServer() {
	const app: Express = express();
	const httpServer = http.createServer(app);

	// Create Apollo server
	const server = new ApolloServer({
		typeDefs,
		resolvers,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
		//catch all unhandled errors to log them and report to Sentry if needed
		formatError: (formattedError, error: unknown) => {
			const originalError = error instanceof GraphQLError ? (error.originalError ?? error) : error;

			if (!(originalError instanceof ValidationError)) {
				Sentry.captureException(originalError);
			}

			return formattedError;
		},
	});

	app.use(cors());
	app.use(cookieParser());
	app.use(express.json());
	app.use("/oauth2", oauthRouter);

	app.use("/auth", authRouter);

	if (isUsingLocalUploads()) {
		app.use("/uploads", express.static(getLocalUploadsDir()));
	}

	app.use("/graphql", graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 1 }));

	await server.start();

	app.use(
		"/graphql",
		expressMiddleware(server, {
			context: async ({ req }) => {
				const token = req.headers.authorization || "";
				const user = verifyToken(token);
				return { user };
			},
		})
	);

	Sentry.setupExpressErrorHandler(app);

	const port = Number(process.env.PORT) || 4000;
	await new Promise<void>((resolve) => httpServer.listen({ port, host: "0.0.0.0" }, resolve));
	console.log(`Server ready at http://localhost:${port}/graphql`);
}

startServer();
