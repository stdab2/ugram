import jwt, { type SignOptions } from "jsonwebtoken";
import "dotenv/config";

export function generateToken(
	email: string,
	name: string,
	expiresIn: SignOptions["expiresIn"] = "7d"
) {
	return jwt.sign({ email, name }, process.env.JWT_SECRET!, { expiresIn });
}

export function verifyToken(token: string) {
	if (!token.startsWith("Bearer ")) return null;
	token = token.slice(7);
	try {
		const user = jwt.verify(token, process.env.JWT_SECRET!);
		return user;
	} catch (error) {
		console.log("Token verification failed", error);
		return null;
	}
}
