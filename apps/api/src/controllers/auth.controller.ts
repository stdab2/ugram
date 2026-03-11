import { Request, Response } from "express";
import {
	createAuthUser,
	getUserByEmail,
	userExists,
	validateUserCredentials,
} from "../services/user.service.js";
import { generateToken, verifyToken } from "../services/jwt.service.js";
import { NotFoundError, BadRequestError, AuthenticationError } from "../../Validators/errors.js";

export async function signup(req: Request, res: Response) {
	if (await userExists(req.body.email)) {
		throw new BadRequestError("User already exists");
	}
	const user = await createAuthUser(
		req.body.email,
		req.body.password,
		req.body.firstName,
		req.body.lastName,
		req.body.phone
	);

	const token = generateToken(user.email, `${user.firstName} ${user.lastName}`);

	const id = user.id;
	const userName = user.userName;
	const email = user.email;
	const firstName = user.firstName;
	const lastName = user.lastName;
	const profilePictureUrl = user.picture;
	const phoneNumber = user.phoneNumber;

	return res.status(200).json({
		success: true,
		token,
		user: { id, userName, email, firstName, lastName, profilePictureUrl, phoneNumber },
	});
}

export async function login(req: Request, res: Response) {
	const user = await validateUserCredentials(req.body.email, req.body.password);
	if (user === null) {
		throw new AuthenticationError("Invalid email or password");
	}

	const token = generateToken(user.email, `${user.firstName} ${user.lastName}`);

	const id = user.id;
	const userName = user.userName;
	const email = user.email;
	const firstName = user.firstName;
	const lastName = user.lastName;
	const profilePictureUrl = user.picture;
	const phoneNumber = user.phoneNumber;

	return res.status(200).json({
		token,
		user: { id, userName, email, firstName, lastName, profilePictureUrl, phoneNumber },
	});
}

export async function me(req: Request, res: Response) {
	const token = req.headers.authorization;
	if (!token) {
		throw new AuthenticationError("Unauthorized");
	}
	const jwtUser = verifyToken(token);
	if (!jwtUser) {
		throw new AuthenticationError("Unauthorized");
	}

	const user = await getUserByEmail(jwtUser.email);

	if (user === null) {
		throw new NotFoundError("User not found");
	}

	const id = user.id;
	const userName = user.userName;
	const email = user.email;
	const firstName = user.firstName;
	const lastName = user.lastName;
	const profilePictureUrl = user.picture;
	const phoneNumber = user.phoneNumber;

	return res.status(200).json({
		success: true,
		user: { id, userName, email, firstName, lastName, profilePictureUrl, phoneNumber },
	});
}
