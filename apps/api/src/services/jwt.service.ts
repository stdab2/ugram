import jwt, { type SignOptions } from "jsonwebtoken";

export function generateToken(
	sub: string,
	email: string,
	name: string,
	expiresIn: SignOptions["expiresIn"] = "7d"
) {
	jwt.sign({ sub, email, name }, process.env.JWT_SECRET!, { expiresIn });
}
