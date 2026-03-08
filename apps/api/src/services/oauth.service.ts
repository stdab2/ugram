import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import "dotenv/config";
import { googleClient } from "../lib/google.js";
import { generateToken } from "./jwt.service.js";
import { findOrCreateOauthUser } from "./user.service.js";
import type { CodeChallengeMethod } from "google-auth-library";

export function buildGoogleAuthorizationUrl() {
	const { state, codeVerifier, codeChallenger } = generatePkce();

	const authorizationUrl = googleClient.generateAuthUrl({
		access_type: "offline",
		prompt: "consent",
		scope: ["openid", "email", "profile"],
		state,
		code_challenge: codeChallenger,
		code_challenge_method: "S256" as CodeChallengeMethod,
	});

	return { authorizationUrl, state, codeVerifier };
}

type CompleteGoogleOAuthInput = {
	code: string;
	state: string;
	cookieState?: string;
	codeVerifier?: string;
};

export async function completeGoogleOAuth({
	code,
	state,
	cookieState,
	codeVerifier,
}: CompleteGoogleOAuthInput) {
	if (!code || !state) {
		throw new Error("Missing code/state");
	}

	if (!cookieState || state !== cookieState) {
		throw new Error("State mismatch");
	}

	if (!codeVerifier) {
		throw new Error("Missing PKCE verifier");
	}

	const { tokens } = await googleClient.getToken({
		code,
		codeVerifier,
		redirect_uri: process.env.GOOGLE_REDIRECT_URI,
	});

	if (!tokens.id_token) {
		throw new Error("Missing id_token from Google");
	}

	const { googleSub, email, name } = await validateGoogleToken(googleClient, tokens.id_token);

	const splittedName = name.split(" ");
	const firstName = splittedName[0];
	const lastName = splittedName.slice(1).join(" ") || firstName;

	await findOrCreateOauthUser(googleSub, email, firstName, lastName);

	return generateToken(email, name);
}

export function generatePkce() {
	const state = crypto.randomBytes(16).toString("base64url");
	const codeVerifier = crypto.randomBytes(32).toString("base64url");
	const codeChallenger = crypto
		.createHash("sha256")
		.update(codeVerifier)
		.digest()
		.toString("base64url");

	return { state, codeVerifier, codeChallenger };
}

export async function validateGoogleToken(googleClient: OAuth2Client, idToken: string) {
	const ticket = await googleClient.verifyIdToken({
		idToken,
		audience: process.env.GOOGLE_CLIENT_ID,
	});

	const payload = ticket.getPayload();

	console.log("Google token payload:", payload);

	if (!payload?.sub || !payload.email || !payload.name) {
		throw new Error("Invalid Goohle token payload");
	}

	const googleSub = payload.sub;
	const email = payload.email;
	const name = payload.name;

	return { googleSub, email, name };
}
