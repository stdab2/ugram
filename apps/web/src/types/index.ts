import type { HashtagsQuery, PostsQuery, SearchQuery, UsersQuery } from "@/generated/graphql";

export type UserType = UsersQuery["users"][number] | SearchQuery["search"]["users"][number];

export type PostType = PostsQuery["posts"][number] | SearchQuery["search"]["posts"][number];

export type HashtagType =
	| HashtagsQuery["hashtags"][number]
	| SearchQuery["search"]["hashtags"][number];

export type { SearchType } from "./search";
export type {
	ErrorType,
	LogSeverity,
	ErrorContext,
	AppError,
	RetryConfig,
	AppErrorWithToast,
} from "./error";
export type { User, AuthContextType } from "./auth";
