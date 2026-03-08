import { Request, Response } from "express";
import { createAuthUser, userExists, validateUserCredentials } from "../services/user.service.js";
import { generateToken } from "../services/jwt.service.js";

export async function signup(req: Request, res: Response) {
	if (await userExists(req.body.email)) {
		return res.status(400).json({ success: false, message: "User already exists" });
	}
	const user = await createAuthUser(
		req.body.email,
		req.body.password,
		req.body.firstName,
		req.body.lastName,
		req.body.phone
	);

	const token = generateToken(user.email, `${user.firstName} ${user.lastName}`);

	return res.status(200).json({ success: true, token });
}

export async function login(req: Request, res: Response) {
	const user = await validateUserCredentials(req.body.email, req.body.password);
	if (user === null) {
		return res.status(401).json({ success: false, message: "Invalid email or password" });
	}

	const token = generateToken(user.email, `${user.firstName} ${user.lastName}`);

	return res.status(200).json({ success: true, token });
}
