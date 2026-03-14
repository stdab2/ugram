export type UserContext = {
	user: {
		id: number;
		email: string;
		name: string;
		iat: number;
		exp: number;
	} | null;
};
