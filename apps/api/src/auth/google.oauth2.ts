import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import "dotenv/config";

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

	if (!payload?.sub || !payload.email || !payload.name) {
		throw new Error("Invalid Goohle token payload");
	}

	const googleSub = payload.sub;
	const email = payload.email;
	const name = payload.name;

	return { googleSub, email, name };
}
