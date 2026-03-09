export interface User {
	id: number;
	userName: string;
	email: string;
	firstName: string;
	lastName: string;
	profilePictureUrl?: string;
	phoneNumber?: string;
}

export interface AuthContextType {
	userAuth: User | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
}
