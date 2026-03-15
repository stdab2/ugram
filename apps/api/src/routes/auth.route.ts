import { Router } from "express";
import { login, me } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.get("/me", me);

export default authRouter;
