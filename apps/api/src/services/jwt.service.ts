import jwt, { type SignOptions } from "jsonwebtoken";
import "dotenv/config";
import type { UserContext } from "../types/userContext.types.js";

export function generateToken(
	email: string,
	name: string,
	expiresIn: SignOptions["expiresIn"] = "7d"
) {
	return jwt.sign({ email, name }, process.env.JWT_SECRET!, { expiresIn });
}

export function verifyToken(token: string): UserContext["user"] | null {
	if (!token.startsWith("Bearer ")) return null;
	token = token.slice(7);
	try {
		const user = jwt.verify(token, process.env.JWT_SECRET!);
		return user as UserContext["user"];
	} catch (error) {
		console.log("Token verification failed", error);
		return null;
	}
}
