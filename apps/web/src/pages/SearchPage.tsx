import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { SearchFilters } from "@/components/SearchFilters";
import { UserSearchResult } from "@/components/UserSearchResult";
import { HashtagSearchResult } from "@/components/HashtagSearchResult";
import { PostGrid, type PostGridPost } from "@/components/PostGrid";
import { PostModal } from "@/components/PostModal";
import { SearchSkeleton } from "@/components/SearchSkeleton";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/Empty";
import { Button } from "@/components/ui/Button";
import type { SearchType } from "@/types/search";
import { AlertCircle, RefreshCcw } from "lucide-react";
import {
	useUsersQuery,
	usePopularPostsQuery,
	useSearchQuery,
	useHashtagsQuery,
} from "@/generated/graphql";
import { PageFade } from "@/components/PageFade";
import { useDebounce } from "@/hooks/use-debounce";

const INITIAL_HASHTAGS_LIMIT = 3;
const INITIAL_USERS_LIMIT = 5;
const INITIAL_POSTS_LIMIT = 6;
const LOAD_MORE_HASHTAGS_INCREMENT = 3;
const LOAD_MORE_USERS_INCREMENT = 5;
const LOAD_MORE_POSTS_INCREMENT = 6;
const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

export function SearchPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeFilter, setActiveFilter] = useState<SearchType>("all");
	// const [selectedPost, setSelectedPost] = useState<PostsQuery["posts"][0] | null>(null);
	const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

	// Track pagination state
	const [hasMoreHashtags, setHasMoreHashtags] = useState(true);
	const [hasMoreUsers, setHasMoreUsers] = useState(true);
	const [hasMorePosts, setHasMorePosts] = useState(true);
	const [hasMoreSearchHashtags, setHasMoreSearchHashtags] = useState(true);
	const [hasMoreSearchUsers, setHasMoreSearchUsers] = useState(true);
	const [hasMoreSearchPosts, setHasMoreSearchPosts] = useState(true);

	// Debounce search query
	const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);
	const isSearching = debouncedSearchQuery.trim().length >= MIN_SEARCH_LENGTH;

	const resetSearchHasMore = () => {
		setHasMoreSearchHashtags(true);
		setHasMoreSearchUsers(true);
		setHasMoreSearchPosts(true);
	};

	const handleSearchQueryChange = (value: string) => {
		setSearchQuery(value);
		if (value.trim().length >= MIN_SEARCH_LENGTH) {
			resetSearchHasMore();
		}
	};

	const handleSearchClear = () => {
		setSearchQuery("");
		resetSearchHasMore();
	};

	// Fetch hashtags
	const {
		data: hashtagsData,
		loading: hashtagsLoading,
		error: hashtagsError,
		refetch: refetchHashtags,
		fetchMore: fetchMoreHashtags,
	} = useHashtagsQuery({
		variables: { limit: INITIAL_HASHTAGS_LIMIT, offset: 0 },
		skip: isSearching,
		onCompleted: (data) => {
			setHasMoreHashtags(data.hashtags.length === INITIAL_HASHTAGS_LIMIT);
		},
	});

	// Fetch initial users
	const {
		data: initialUsersData,
		loading: initialUsersLoading,
		error: initialUsersError,
		refetch: refetchInitialUsers,
		fetchMore: fetchMoreUsers,
	} = useUsersQuery({
		variables: {
			limit: INITIAL_USERS_LIMIT,
			offset: 0,
		},
		skip: isSearching,
		onCompleted: (data) => {
			setHasMoreUsers(data.users.length === INITIAL_USERS_LIMIT);
		},
	});

	// Fetch initial posts
	const {
		data: initialPostsData,
		loading: initialPostsLoading,
		error: initialPostsError,
		refetch: refetchInitialPosts,
		fetchMore: fetchMorePosts,
	} = usePopularPostsQuery({
		variables: { limit: INITIAL_POSTS_LIMIT, offset: 0 },
		skip: isSearching,
		onCompleted: (data) => {
			setHasMorePosts(data.popularPosts.length === INITIAL_POSTS_LIMIT);
		},
	});

	// Unified search query
	const {
		data: searchData,
		loading: searchLoading,
		error: searchError,
		refetch: refetchSearch,
		fetchMore: fetchMoreSearch,
	} = useSearchQuery({
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
		onCompleted: (data) => {
			setHasMoreSearchHashtags(data.search.hashtags.length === INITIAL_HASHTAGS_LIMIT);
			setHasMoreSearchUsers(data.search.users.length === INITIAL_USERS_LIMIT);
			setHasMoreSearchPosts(data.search.posts.length === INITIAL_POSTS_LIMIT);
		},
	});

	// Determine which data to use
	const allUsers = isSearching ? searchData?.search.users || [] : initialUsersData?.users || [];
	const allPosts = isSearching
		? searchData?.search.posts || []
		: initialPostsData?.popularPosts || [];
	const allHashtags = isSearching
		? searchData?.search.hashtags || []
		: hashtagsData?.hashtags || [];
	const isLoading = isSearching
		? searchLoading
		: initialUsersLoading || initialPostsLoading || hashtagsLoading;
	const hasError = isSearching
		? searchError
		: initialUsersError || initialPostsError || hashtagsError;

	// Show loading only on initial load
	if (
		(initialUsersLoading || initialPostsLoading) &&
		!initialUsersData &&
		!initialPostsData &&
		!isSearching
	) {
		return (
			<PageFade key="loading" delay={0.3}>
				<SearchSkeleton />
			</PageFade>
		);
	}

	// Error state
	if (hasError) {
		return (
			<PageFade key="error">
				<div className="flex justify-center min-h-screen bg-background items-center">
					<Empty>
						<EmptyHeader>
							<AlertCircle className="h-12 w-12 mb-4 text-muted-foreground" />
							<EmptyTitle>Unable to Load Search</EmptyTitle>
							<EmptyDescription>
								{searchError?.message ||
									hashtagsError?.message ||
									initialUsersError?.message ||
									initialPostsError?.message ||
									"Something went wrong"}
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button
								onClick={() => {
									if (isSearching) {
										refetchSearch();
									} else {
										refetchHashtags();
										refetchInitialUsers();
										refetchInitialPosts();
									}
								}}
								variant="default"
							>
								<RefreshCcw className="mr-2 h-4 w-4" />
								Try Again
							</Button>
						</EmptyContent>
					</Empty>
				</div>
			</PageFade>
		);
	}

	const handlePostClick = (post: PostGridPost) => {
		setSelectedPostId(Number(post.id));
	};

	const handleUserPostClick = (postId: string | number) => {
		setSelectedPostId(Number(postId));
	};

	const handleHashtagClick = (hashtagName: string) => {
		handleSearchQueryChange(hashtagName);
		setActiveFilter("posts");
	};

	const handleLoadMoreHashtags = () => {
		if ((isSearching && !hasMoreSearchHashtags) || (!isSearching && !hasMoreHashtags)) return;

		if (isSearching) {
			// For search, use fetchMore with offset
			const currentLength = searchData?.search.hashtags.length || 0;
			fetchMoreSearch({
				variables: {
					query: debouncedSearchQuery,
					usersLimit: 0, // Don't load more users
					usersOffset: 0,
					postsLimit: 0, // Don't load more posts
					postsOffset: 0,
					hashtagsLimit: LOAD_MORE_HASHTAGS_INCREMENT,
					hashtagsOffset: currentLength,
				},
				updateQuery: (prev, { fetchMoreResult }) => {
					if (!fetchMoreResult) return prev;
					const newHashtags = fetchMoreResult.search.hashtags;
					setHasMoreSearchHashtags(newHashtags.length === LOAD_MORE_HASHTAGS_INCREMENT);
					return {
						__typename: "Query",
						search: {
							...prev.search,
							hashtags: [...prev.search.hashtags, ...newHashtags],
						},
					};
				},
			});
		} else {
			// For default view, use fetchMore with offset
			const currentLength = hashtagsData?.hashtags.length || 0;
			fetchMoreHashtags({
				variables: {
					offset: currentLength,
					limit: LOAD_MORE_HASHTAGS_INCREMENT,
				},
				updateQuery: (prev, { fetchMoreResult }) => {
					if (!fetchMoreResult) return prev;
					const newHashtags = fetchMoreResult.hashtags;
					setHasMoreHashtags(newHashtags.length === LOAD_MORE_HASHTAGS_INCREMENT);
					return {
						__typename: "Query",
						hashtags: [...prev.hashtags, ...newHashtags],
					};
				},
			});
		}
	};
	const selectedPost =
		selectedPostId !== null ? (allPosts.find((p) => p.id === selectedPostId) ?? null) : null;
	const handleLoadMoreUsers = () => {
		if ((isSearching && !hasMoreSearchUsers) || (!isSearching && !hasMoreUsers)) return;

		if (isSearching) {
			// For search, use fetchMore with offset
			const currentLength = searchData?.search.users.length || 0;
			fetchMoreSearch({
				variables: {
					query: debouncedSearchQuery,
					usersLimit: LOAD_MORE_USERS_INCREMENT,
					usersOffset: currentLength,
					postsLimit: 0, // Don't load more posts
					postsOffset: 0,
					hashtagsLimit: 0, // Don't load more hashtags
					hashtagsOffset: 0,
				},
				updateQuery: (prev, { fetchMoreResult }) => {
					if (!fetchMoreResult) return prev;
					const newUsers = fetchMoreResult.search.users;
					setHasMoreSearchUsers(newUsers.length === LOAD_MORE_USERS_INCREMENT);
					return {
						__typename: "Query",
						search: {
							...prev.search,
							users: [...prev.search.users, ...newUsers],
						},
					};
				},
			});
		} else {
			// For default view, use fetchMore with offset
			const currentLength = initialUsersData?.users.length || 0;
			fetchMoreUsers({
				variables: {
					offset: currentLength,
					limit: LOAD_MORE_USERS_INCREMENT,
				},
				updateQuery: (prev, { fetchMoreResult }) => {
					if (!fetchMoreResult) return prev;
					const newUsers = fetchMoreResult.users;
					setHasMoreUsers(newUsers.length === LOAD_MORE_USERS_INCREMENT);
					return {
						__typename: "Query",
						users: [...prev.users, ...newUsers],
					};
				},
			});
		}
	};

	const handleLoadMorePosts = () => {
		if ((isSearching && !hasMoreSearchPosts) || (!isSearching && !hasMorePosts)) return;

		if (isSearching) {
			// For search, use fetchMore with offset
			const currentLength = searchData?.search.posts.length || 0;
			fetchMoreSearch({
				variables: {
					query: debouncedSearchQuery,
					usersLimit: 0, // Don't load more users
					usersOffset: 0,
					postsLimit: LOAD_MORE_POSTS_INCREMENT,
					postsOffset: currentLength,
					hashtagsLimit: 0, // Don't load more hashtags
					hashtagsOffset: 0,
				},
				updateQuery: (prev, { fetchMoreResult }) => {
					if (!fetchMoreResult) return prev;
					const newPosts = fetchMoreResult.search.posts;
					setHasMoreSearchPosts(newPosts.length === LOAD_MORE_POSTS_INCREMENT);
					return {
						__typename: "Query",
						search: {
							...prev.search,
							posts: [...prev.search.posts, ...newPosts],
						},
					};
				},
			});
		} else {
			// For default view, use fetchMore with offset
			const currentLength = initialPostsData?.popularPosts.length || 0;
			fetchMorePosts({
				variables: {
					offset: currentLength,
					limit: LOAD_MORE_POSTS_INCREMENT,
				},
				updateQuery: (prev, { fetchMoreResult }) => {
					if (!fetchMoreResult) return prev;
					const newPosts = fetchMoreResult.popularPosts;
					setHasMorePosts(newPosts.length === LOAD_MORE_POSTS_INCREMENT);
					return {
						__typename: "Query",
						popularPosts: [...prev.popularPosts, ...newPosts],
					};
				},
			});
		}
	};

	// Show typing indicator when user is typing but debounce hasn't triggered yet
	const isTyping =
		searchQuery.trim().length >= MIN_SEARCH_LENGTH && searchQuery !== debouncedSearchQuery;

	// Filter based on active filter
	const displayUsers = activeFilter === "posts" || activeFilter === "hashtags" ? [] : allUsers;
	const displayPosts = activeFilter === "users" || activeFilter === "hashtags" ? [] : allPosts;
	const displayHashtags = activeFilter === "users" || activeFilter === "posts" ? [] : allHashtags;

	return (
		<PageFade>
			<div className="max-w-[630px] mx-auto pb-20">
				{/* Search Bar */}
				<div className="sticky top-0 z-10 bg-background border-b">
					<div className="p-4">
						<SearchBar
							value={searchQuery}
							onChange={handleSearchQueryChange}
							onClear={handleSearchClear}
							placeholder="Search users, posts, hashtags..."
						/>
					</div>
					<SearchFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
				</div>

				{/* Content */}
				<div className="mt-2">
					{!isSearching && !isTyping ? (
						<>
							{/* Hashtags - Only show when filter is "all" or "hashtags" */}
							{(activeFilter === "all" || activeFilter === "hashtags") && (
								<div className="mb-6">
									<div className="px-4 py-3">
										<h2 className="font-semibold">Popular Hashtags</h2>
									</div>
									<div className="flex flex-col gap-2 px-4">
										{hashtagsData?.hashtags.map((hashtag) => (
											<HashtagSearchResult
												key={hashtag.id}
												hashtag={hashtag}
												onClick={() => handleHashtagClick(hashtag.name)}
											/>
										))}
									</div>
									{hashtagsData && hasMoreHashtags && (
										<div className="px-4 py-3">
											<Button
												variant="ghost"
												onClick={handleLoadMoreHashtags}
												disabled={hashtagsLoading}
												className="w-full text-indigo-400 hover:text-indigo-300"
											>
												{hashtagsLoading ? "Loading..." : "See more hashtags"}
											</Button>
										</div>
									)}
								</div>
							)}

							{/* Users List */}
							{(activeFilter === "all" || activeFilter === "users") && (
								<div className="mb-6">
									<div className="px-4 py-3">
										<h2 className="font-semibold">Popular Users</h2>
									</div>
									<div className="flex flex-col gap-4 px-4">
										{displayUsers.map((user) => (
											<UserSearchResult
												key={user.id}
												user={user}
												onPostClick={handleUserPostClick}
											/>
										))}
									</div>
									{initialUsersData && hasMoreUsers && (
										<div className="px-4 py-3">
											<Button
												variant="ghost"
												onClick={handleLoadMoreUsers}
												disabled={initialUsersLoading}
												className="w-full text-indigo-400 hover:text-indigo-300"
											>
												{initialUsersLoading ? "Loading..." : "See more users"}
											</Button>
										</div>
									)}
								</div>
							)}

							{/* Random Posts */}
							{(activeFilter === "all" || activeFilter === "posts") && (
								<div>
									<div className="px-4 py-3">
										<h2 className="font-semibold">Popular Posts</h2>
									</div>
									<PostGrid posts={displayPosts} onPostClick={handlePostClick} />
									{initialPostsData && hasMorePosts && (
										<div className="px-4 py-3">
											<Button
												variant="ghost"
												onClick={handleLoadMorePosts}
												disabled={initialPostsLoading}
												className="w-full text-indigo-400 hover:text-indigo-300"
											>
												{initialPostsLoading ? "Loading..." : "See more posts"}
											</Button>
										</div>
									)}
								</div>
							)}
						</>
					) : (
						<>
							{/* Search Results with Loading State */}
							{isLoading || isTyping ? (
								<PageFade key="skeleton">
									<div className="px-4 py-8">
										<SearchSkeleton />
									</div>
								</PageFade>
							) : (
								<PageFade key={debouncedSearchQuery}>
									{/* Hashtags Results */}
									{(activeFilter === "all" || activeFilter === "hashtags") && (
										<div className="mb-6">
											<div className="px-4 py-3">
												<h2 className="font-semibold">
													{isSearching ? "Hashtags" : "Popular Hashtags"}
												</h2>
											</div>
											{displayHashtags.length > 0 ? (
												<>
													<div className="flex flex-col gap-2 px-4">
														{displayHashtags.map((hashtag) => (
															<HashtagSearchResult
																key={hashtag.id}
																hashtag={hashtag}
																onClick={() => handleHashtagClick(hashtag.name)}
															/>
														))}
													</div>
													{hasMoreSearchHashtags && (
														<div className="px-4 py-3">
															<Button
																variant="ghost"
																onClick={handleLoadMoreHashtags}
																disabled={searchLoading}
																className="w-full text-indigo-400 hover:text-indigo-300"
															>
																{searchLoading ? "Loading..." : "See more hashtags"}
															</Button>
														</div>
													)}
												</>
											) : (
												<p className="px-4 py-8 text-center text-muted-foreground">
													No hashtags found for "{debouncedSearchQuery}"
												</p>
											)}
										</div>
									)}

									{/* Users Results */}
									{(activeFilter === "all" || activeFilter === "users") && (
										<div className="mb-6">
											<div className="px-4 py-3">
												<h2 className="font-semibold">{isSearching ? "Users" : "Popular Users"}</h2>
											</div>
											{displayUsers.length > 0 ? (
												<>
													<div className="space-y-3 px-4">
														{displayUsers.map((user) => (
															<UserSearchResult
																key={user.id}
																user={user}
																onPostClick={handleUserPostClick}
															/>
														))}
													</div>
													{hasMoreSearchUsers && (
														<div className="px-4 py-3">
															<Button
																variant="ghost"
																onClick={handleLoadMoreUsers}
																disabled={searchLoading}
																className="w-full text-indigo-400 hover:text-indigo-300"
															>
																{searchLoading ? "Loading..." : "See more users"}
															</Button>
														</div>
													)}
												</>
											) : (
												<p className="px-4 py-8 text-center text-muted-foreground">
													No users found for "{debouncedSearchQuery}"
												</p>
											)}
										</div>
									)}

									{/* Posts Results */}
									{(activeFilter === "all" || activeFilter === "posts") && (
										<div>
											<div className="px-4 py-3">
												<h2 className="font-semibold">{isSearching ? "Posts" : "Popular Posts"}</h2>
											</div>
											{displayPosts.length > 0 ? (
												<>
													<PostGrid posts={displayPosts} onPostClick={handlePostClick} />
													{hasMoreSearchPosts && (
														<div className="px-4 py-3">
															<Button
																variant="ghost"
																onClick={handleLoadMorePosts}
																disabled={searchLoading}
																className="w-full text-indigo-400 hover:text-indigo-300"
															>
																{searchLoading ? "Loading..." : "See more posts"}
															</Button>
														</div>
													)}
												</>
											) : (
												<p className="px-4 py-8 text-center text-muted-foreground">
													No posts found for "{debouncedSearchQuery}"
												</p>
											)}
										</div>
									)}
								</PageFade>
							)}
						</>
					)}
				</div>

				{/* Post Modal */}
				{selectedPost && (
					<PostModal
						open={!!selectedPost}
						onOpenChange={(open) => {
							if (!open) {
								setSelectedPostId(null);
							}
						}}
						post={selectedPost}
						onPostDeletion={() => {
							setSelectedPostId(null);
							if (isSearching) {
								refetchSearch();
							} else {
								refetchInitialPosts();
							}
						}}
					/>
				)}
			</div>
		</PageFade>
	);
}
