export type UserContext = {
	user: {
		email: string;
		name: string;
		iat: number;
		exp: number;
	} | null;
};
