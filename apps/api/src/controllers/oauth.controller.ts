import { Request, Response } from "express";
import { buildGoogleAuthorizationUrl, completeGoogleOAuth } from "../services/oauth.service.js";

export async function startGoogleOAuth(_req: Request, res: Response) {
	const { authorizationUrl, state, codeVerifier } = buildGoogleAuthorizationUrl();

	res.cookie("state", state, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 30_000,
	});

	res.cookie("code_verifier", codeVerifier, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 30_000,
	});

	return res.redirect(authorizationUrl);
}

export async function handleGoogleOAuthCallback(req: Request, res: Response) {
	try {
		const code = String(req.query.code || "");
		const state = String(req.query.state || "");
		const cookieState = req.cookies["state"];
		const codeVerifier = req.cookies["code_verifier"];

		const token = await completeGoogleOAuth({
			code,
			state,
			cookieState,
			codeVerifier,
		});

		res.clearCookie("state");
		res.clearCookie("code_verifier");

		return res.send(`
      <!DOCTYPE html>
      <html>
      <body>
        <script>
          const token = "${token}";
          window.opener.postMessage(
            { type: "oauth2_success", token },
            "${process.env.FRONTEND_ORIGIN}"
          );
          window.close();
        </script>
      </body>
      </html>
    `);
	} catch (error) {
		console.error(error);
		return res.status(500).send("Authentication failed");
	}
}
