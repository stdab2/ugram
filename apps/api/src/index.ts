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
import { OAuth2Client, CodeChallengeMethod } from "google-auth-library";
import "dotenv/config";
import { generatePkce, validateGoogleToken } from "./auth/google.oauth2.js";
import { generateToken } from "./services/jwt.service.js";

async function startServer() {
	const app: Express = express();
	const httpServer = http.createServer(app);

	// Create Apollo server
	const server = new ApolloServer({
		typeDefs,
		resolvers,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
	});

	const googleClient = new OAuth2Client(
		process.env.CLIENT_ID,
		process.env.CLIENT_SECRET,
		process.env.GOOGLE_REDIRECT_URI
	);

	app.use(cors());
	app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

	app.get("/oauth2/google", (req, res) => {
		const { state, codeVerifier, codeChallenger } = generatePkce();

		const scope = ["openid", "email", "profile"];

		res.cookie("state", state, {
			httpOnly: true,
			secure: process.env.ENV === "production",
			sameSite: "lax",
			maxAge: 30000,
		});

		res.cookie("code_verifier", codeVerifier, {
			httpOnly: true,
			secure: process.env.ENV === "production",
			sameSite: "lax",
			maxAge: 30000,
		});

		const authorizationUrl = googleClient.generateAuthUrl({
			access_type: "offline",
			prompt: "consent",
			scope,
			state,
			code_challenge: codeChallenger,
			code_challenge_method: "S256" as CodeChallengeMethod,
		});

		res.redirect(authorizationUrl);
	});

	app.get("/oauth2/callback/google", async (req, res) => {
		const code = String(req.query.code);
		const state = String(req.query.state);

		const cookieState = req.cookies["state"];
		const codeVerifier = req.cookies["code_verifier"];

		if (!code || !state) return res.status(400).send("Missing code/state");
		if (!cookieState || state !== cookieState) {
			console.log("State Mismatch. Possible CSRF attack");
			res.end("State Mismatch. Possible CSRF attack");
		}
		if (!codeVerifier) return res.status(400).send("Missing PKCE veriifier");

		res.clearCookie("state");
		res.clearCookie("code_verifier");

		const { tokens } = await googleClient.getToken({
			code,
			codeVerifier,
			redirect_uri: process.env.GOOGLE_REDIRECT_URI,
		});

		if (!tokens.id_token)
			return res.status(400).send("Missing id_token from Google. Cannot authenticate user");

		const { googleSub, email, name } = await validateGoogleToken(googleClient, tokens.id_token);

		const accesToken = generateToken(googleSub, email, name, "5m");
		console.log(accesToken);
	});

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
