import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";

export async function findOrCreateOauthUser(
	googleSub: string,
	email: string,
	firstName: string,
	lastName: string
) {
	let user = await prisma.userUgram.findUnique({
		where: { googleSub: googleSub },
	});

	if (user) {
		return user;
	}

	user = await prisma.userUgram.findUnique({
		where: { email: email },
	});

	if (user) {
		if (!user.googleSub) {
			user = await prisma.userUgram.update({
				where: { email: email },
				data: { googleSub: googleSub },
			});
		}
		return user;
	}

	user = await prisma.userUgram.create({
		data: {
			userName: email,
			email: email,
			googleSub: googleSub,
			firstName: firstName,
			lastName: lastName,
		},
	});

	return user;
}

export async function createAuthUser(
	email: string,
	password: string,
	firstName: string,
	lastName: string,
	phone: string
) {
	const encryptedPassword = await bcrypt.hash(password, 10);
	const user = await prisma.userUgram.create({
		data: {
			userName: email,
			email: email,
			password: encryptedPassword,
			firstName: firstName,
			lastName: lastName,
			phoneNumber: phone,
		},
	});

	return user;
}

export async function validateUserCredentials(email: string, password: string) {
	const user = await prisma.userUgram.findUnique({
		where: { email: email },
	});

	if (!user || !user.password) {
		return null;
	}

	const isPasswordValid = await bcrypt.compare(password, user.password);

	if (!isPasswordValid) {
		return null;
	}

	return user;
}

export async function userExists(email: string): Promise<boolean> {
	const user = await prisma.userUgram.findUnique({
		where: { email: email },
	});

	return !!user;
}
