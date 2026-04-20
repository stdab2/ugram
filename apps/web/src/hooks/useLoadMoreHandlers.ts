import { PAGINATION } from "@/hooks/useSearchState";
import type {
	HashtagsQuery,
	HashtagsQueryHookResult,
	PopularPostsQuery,
	PopularPostsQueryHookResult,
	SearchQuery,
	SearchQueryHookResult,
	UsersQuery,
	UsersQueryHookResult,
} from "@/generated/graphql";
import type { UseLoadMoreReturn } from "@/hooks/useLoadMore";

const { LOAD_MORE_HASHTAGS_INCREMENT, LOAD_MORE_USERS_INCREMENT, LOAD_MORE_POSTS_INCREMENT } =
	PAGINATION;

interface LoadMoreHandlersProps {
	isSearching: boolean;
	debouncedSearchQuery: string;
	searchQueryData: SearchQueryHookResult;
	hashtagsQuery: HashtagsQueryHookResult;
	usersQuery: UsersQueryHookResult;
	postsQuery: PopularPostsQueryHookResult;
	hashtags: UseLoadMoreReturn;
	users: UseLoadMoreReturn;
	posts: UseLoadMoreReturn;
}

export function useLoadMoreHandlers({
	isSearching,
	debouncedSearchQuery,
	searchQueryData,
	hashtagsQuery,
	usersQuery,
	postsQuery,
	hashtags,
	users,
	posts,
}: LoadMoreHandlersProps) {
	const handleLoadMoreHashtags = () => {
		if (isSearching) {
			const currentLength = searchQueryData.data?.search.hashtags.length ?? 0;
			searchQueryData.fetchMore({
				variables: {
					query: debouncedSearchQuery,
					usersLimit: 0,
					usersOffset: 0,
					postsLimit: 0,
					postsOffset: 0,
					hashtagsLimit: LOAD_MORE_HASHTAGS_INCREMENT,
					hashtagsOffset: currentLength,
				},
				updateQuery: (
					prev: SearchQuery,
					{ fetchMoreResult }: { fetchMoreResult?: SearchQuery }
				) => {
					if (!fetchMoreResult) return prev;
					const newItems = fetchMoreResult.search.hashtags;
					hashtags.onFetched(newItems.length, LOAD_MORE_HASHTAGS_INCREMENT);
					return {
						__typename: "Query",
						search: { ...prev.search, hashtags: [...prev.search.hashtags, ...newItems] },
					};
				},
			});
		} else {
			const currentLength = hashtagsQuery.data?.hashtags.length ?? 0;
			hashtagsQuery.fetchMore({
				variables: { offset: currentLength, limit: LOAD_MORE_HASHTAGS_INCREMENT },
				updateQuery: (
					prev: HashtagsQuery,
					{ fetchMoreResult }: { fetchMoreResult?: HashtagsQuery }
				) => {
					if (!fetchMoreResult) return prev;
					const newItems = fetchMoreResult.hashtags;
					hashtags.onFetched(newItems.length, LOAD_MORE_HASHTAGS_INCREMENT);
					return { __typename: "Query", hashtags: [...prev.hashtags, ...newItems] };
				},
			});
		}
	};

	const handleLoadMoreUsers = () => {
		if (isSearching) {
			const currentLength = searchQueryData.data?.search.users.length ?? 0;
			searchQueryData.fetchMore({
				variables: {
					query: debouncedSearchQuery,
					usersLimit: LOAD_MORE_USERS_INCREMENT,
					usersOffset: currentLength,
					postsLimit: 0,
					postsOffset: 0,
					hashtagsLimit: 0,
					hashtagsOffset: 0,
				},
				updateQuery: (
					prev: SearchQuery,
					{ fetchMoreResult }: { fetchMoreResult?: SearchQuery }
				) => {
					if (!fetchMoreResult) return prev;
					const newItems = fetchMoreResult.search.users;
					users.onFetched(newItems.length, LOAD_MORE_USERS_INCREMENT);
					return {
						__typename: "Query",
						search: { ...prev.search, users: [...prev.search.users, ...newItems] },
					};
				},
			});
		} else {
			const currentLength = usersQuery.data?.users.length ?? 0;
			usersQuery.fetchMore({
				variables: { offset: currentLength, limit: LOAD_MORE_USERS_INCREMENT },
				updateQuery: (prev: UsersQuery, { fetchMoreResult }: { fetchMoreResult?: UsersQuery }) => {
					if (!fetchMoreResult) return prev;
					const newItems = fetchMoreResult.users;
					users.onFetched(newItems.length, LOAD_MORE_USERS_INCREMENT);
					return { __typename: "Query", users: [...prev.users, ...newItems] };
				},
			});
		}
	};

	const handleLoadMorePosts = () => {
		if (isSearching) {
			const currentLength = searchQueryData.data?.search.posts.length ?? 0;
			searchQueryData.fetchMore({
				variables: {
					query: debouncedSearchQuery,
					usersLimit: 0,
					usersOffset: 0,
					postsLimit: LOAD_MORE_POSTS_INCREMENT,
					postsOffset: currentLength,
					hashtagsLimit: 0,
					hashtagsOffset: 0,
				},
				updateQuery: (
					prev: SearchQuery,
					{ fetchMoreResult }: { fetchMoreResult?: SearchQuery }
				) => {
					if (!fetchMoreResult) return prev;
					const newItems = fetchMoreResult.search.posts;
					posts.onFetched(newItems.length, LOAD_MORE_POSTS_INCREMENT);
					return {
						__typename: "Query",
						search: { ...prev.search, posts: [...prev.search.posts, ...newItems] },
					};
				},
			});
		} else {
			const currentLength = postsQuery.data?.popularPosts.length ?? 0;
			postsQuery.fetchMore({
				variables: { offset: currentLength, limit: LOAD_MORE_POSTS_INCREMENT },
				updateQuery: (
					prev: PopularPostsQuery,
					{ fetchMoreResult }: { fetchMoreResult?: PopularPostsQuery }
				) => {
					if (!fetchMoreResult) return prev;
					const newItems = fetchMoreResult.popularPosts;
					posts.onFetched(newItems.length, LOAD_MORE_POSTS_INCREMENT);
					return { __typename: "Query", popularPosts: [...prev.popularPosts, ...newItems] };
				},
			});
		}
	};

	return {
		handleLoadMoreHashtags,
		handleLoadMoreUsers,
		handleLoadMorePosts,
	};
}
