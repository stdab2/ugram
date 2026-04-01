import { Request, Response } from "express";
import { validateUserCredentials, getUserById } from "../services/user.service.js";
import { generateToken, verifyToken } from "../services/jwt.service.js";
import { NotFoundError, AuthenticationError } from "../../Validators/errors.js";

export async function login(req: Request, res: Response) {
	const user = await validateUserCredentials(req.body.email, req.body.password);
	if (user === null) {
		throw new AuthenticationError("Invalid email or password");
	}

	const token = generateToken(user.email, `${user.firstName} ${user.lastName}`, user.id);

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

	const user = await getUserById(jwtUser.id);

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
	//ajout de commentaire inutile pour trigger le redeploy du frontend
}
