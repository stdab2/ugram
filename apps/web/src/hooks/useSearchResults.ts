import { useEffect } from "react";
import {
	useUsersQuery,
	usePopularPostsQuery,
	useSearchQuery,
	useHashtagsQuery,
	useSearchAutocompleteQuery,
} from "@/generated/graphql";
import { useLoadMore } from "@/hooks/useLoadMore";
import { PAGINATION } from "@/hooks/useSearchState";
import type { HashtagType, PostType, UserType } from "@/types";

const { INITIAL_HASHTAGS_LIMIT, INITIAL_USERS_LIMIT, INITIAL_POSTS_LIMIT } = PAGINATION;

interface SearchResultsState {
	// Queries
	hashtagsQuery: ReturnType<typeof useHashtagsQuery>;
	usersQuery: ReturnType<typeof useUsersQuery>;
	postsQuery: ReturnType<typeof usePopularPostsQuery>;
	searchQuery: ReturnType<typeof useSearchQuery>;
	autocompleteQuery: ReturnType<typeof useSearchAutocompleteQuery>;

	// Load more handlers
	hashtags: ReturnType<typeof useLoadMore>;
	users: ReturnType<typeof useLoadMore>;
	posts: ReturnType<typeof useLoadMore>;

	// Derived data
	allUsers: UserType[];
	allPosts: PostType[];
	allHashtags: HashtagType[];
	isLoading: boolean;
	hasError: ReturnType<typeof useSearchQuery>["error"];
}

export function useSearchResults(
	debouncedSearchQuery: string,
	isSearching: boolean
): SearchResultsState {
	const hashtags = useLoadMore();
	const users = useLoadMore();
	const posts = useLoadMore();

	// Reset load more state when search mode or debounced query changes
	useEffect(() => {
		hashtags.reset();
		users.reset();
		posts.reset();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSearching, debouncedSearchQuery]);

	// Initial queries (when not searching)
	const hashtagsQuery = useHashtagsQuery({
		variables: { limit: INITIAL_HASHTAGS_LIMIT, offset: 0 },
		skip: isSearching,
	});

	const usersQuery = useUsersQuery({
		variables: { limit: INITIAL_USERS_LIMIT, offset: 0 },
		skip: isSearching,
	});

	const postsQuery = usePopularPostsQuery({
		variables: { limit: INITIAL_POSTS_LIMIT, offset: 0 },
		skip: isSearching,
	});

	// Search query (when searching)
	const searchQuery = useSearchQuery({
		variables: {
			query: debouncedSearchQuery,
			usersLimit: INITIAL_USERS_LIMIT,
			usersOffset: 0,
			postsLimit: INITIAL_POSTS_LIMIT,
			postsOffset: 0,
			hashtagsLimit: INITIAL_HASHTAGS_LIMIT,
			hashtagsOffset: 0,
		},
		skip: !isSearching,
	});

	// Autocomplete query
	const autocompleteQuery = useSearchAutocompleteQuery({
		variables: { query: debouncedSearchQuery, limit: 8 },
		skip: !isSearching,
	});

	// Derive all data
	const allUsers = isSearching
		? (searchQuery.data?.search.users ?? [])
		: (usersQuery.data?.users ?? []);
	const allPosts = isSearching
		? (searchQuery.data?.search.posts ?? [])
		: (postsQuery.data?.popularPosts ?? []);
	const allHashtags = isSearching
		? (searchQuery.data?.search.hashtags ?? [])
		: (hashtagsQuery.data?.hashtags ?? []);

	const isLoading = isSearching
		? searchQuery.loading
		: usersQuery.loading || postsQuery.loading || hashtagsQuery.loading;

	const hasError = isSearching
		? searchQuery.error
		: usersQuery.error || postsQuery.error || hashtagsQuery.error;

	return {
		hashtagsQuery,
		usersQuery,
		postsQuery,
		searchQuery,
		autocompleteQuery,
		hashtags,
		users,
		posts,
		allUsers,
		allPosts,
		allHashtags,
		isLoading,
		hasError,
	};
}
