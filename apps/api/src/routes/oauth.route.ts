import { Router } from "express";
import { startGoogleOAuth, handleGoogleOAuthCallback } from "../controllers/oauth.controller.js";

const oauthRouter = Router();

oauthRouter.get("/google", startGoogleOAuth);
oauthRouter.get("/callback/google", handleGoogleOAuthCallback);

export default oauthRouter;
