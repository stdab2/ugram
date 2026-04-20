import { Router } from "express";
import { login, me } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.get("/me", me);

// Temporary endpoints to validate CloudFront 4xx/5xx metrics from an API-routed path.
authRouter.get("/debug/400", (_req, res) => {
	res.status(400).send("test 400");
});

authRouter.get("/debug/404", (_req, res) => {
	res.status(404).send("test 404");
});

authRouter.get("/debug/500", (_req, res) => {
	res.status(500).send("test 500");
});

export default authRouter;
