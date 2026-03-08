import { OAuth2Client } from "google-auth-library";
import "dotenv/config";

export const googleClient = new OAuth2Client(
	process.env.CLIENT_ID,
	process.env.CLIENT_SECRET,
	process.env.GOOGLE_REDIRECT_URI
);
