export interface RecentSearch {
	id: string;
	query: string;
	type: "user" | "hashtag" | "general";
	timestamp: Date;
}

export type SearchType = "all" | "users" | "posts" | "hashtags";
