export type ProfileView = "posts" | "followers" | "following";

export type FollowListUser = {
	id: number;
	userName: string;
	firstName: string;
	lastName: string;
	picture: string | null;
};
