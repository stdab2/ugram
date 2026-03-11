import { Router } from "express";
import { signup, login, me } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/me", me);

export default authRouter;
