import { useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { SearchFilters } from "@/components/SearchFilters";
import { UserSearchResult } from "@/components/UserSearchResult";
import { HashtagSearchResult } from "@/components/HashtagSearchResult";
import { PostGrid } from "@/components/PostGrid";
import { PostModal } from "@/components/PostModal";
import { SearchSkeleton } from "@/components/SearchSkeleton";
import { SearchResultsSection } from "@/components/search/SearchResultsSection";
import { SearchPostCard } from "@/components/search/SearchPostCard";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/Empty";
import { Button } from "@/components/ui/Button";
import { AlertCircle, RefreshCcw } from "lucide-react";
import {
	useUsersQuery,
	usePostsQuery,
	useSearchQuery,
	useHashtagsQuery,
	useSearchAutocompleteQuery,
} from "@/generated/graphql";
import { PageFade } from "@/components/PageFade";
import { useSearchState, PAGINATION } from "@/hooks/useSearchState";
import { useLoadMore } from "@/hooks/useLoadMore";

const {
	INITIAL_HASHTAGS_LIMIT,
	INITIAL_USERS_LIMIT,
	INITIAL_POSTS_LIMIT,
	LOAD_MORE_HASHTAGS_INCREMENT,
	LOAD_MORE_USERS_INCREMENT,
	LOAD_MORE_POSTS_INCREMENT,
} = PAGINATION;

export function SearchPage() {
	const {
		searchQuery,
		setSearchQuery,
		activeFilter,
		setActiveFilter,
		selectedPostId,
		setSelectedPostId,
		debouncedSearchQuery,
		isSearching,
		isTyping,
		handlePostClick,
		handleUserPostClick,
		handleHashtagClick,
	} = useSearchState();

	const hashtags = useLoadMore();
	const users = useLoadMore();
	const posts = useLoadMore();

	useEffect(() => {
		hashtags.reset();
		users.reset();
		posts.reset();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSearching]);

	const {
		data: hashtagsData,
		loading: hashtagsLoading,
		error: hashtagsError,
		refetch: refetchHashtags,
		fetchMore: fetchMoreHashtags,
	} = useHashtagsQuery({
		variables: { limit: INITIAL_HASHTAGS_LIMIT, offset: 0 },
		skip: isSearching,
	});

	const {
		data: initialUsersData,
		loading: initialUsersLoading,
		error: initialUsersError,
		refetch: refetchInitialUsers,
		fetchMore: fetchMoreUsers,
	} = useUsersQuery({
		variables: { limit: INITIAL_USERS_LIMIT, offset: 0 },
		skip: isSearching,
	});

	const {
		data: initialPostsData,
		loading: initialPostsLoading,
		error: initialPostsError,
		refetch: refetchInitialPosts,
		fetchMore: fetchMorePosts,
	} = usePostsQuery({
		variables: { limit: INITIAL_POSTS_LIMIT, offset: 0 },
		skip: isSearching,
	});

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
	});

	const { data: autocompleteData } = useSearchAutocompleteQuery({
		variables: { query: debouncedSearchQuery, limit: 8 },
		skip: !isSearching,
	});

	const allUsers = isSearching ? (searchData?.search.users ?? []) : (initialUsersData?.users ?? []);
	const allPosts = isSearching ? (searchData?.search.posts ?? []) : (initialPostsData?.posts ?? []);
	const allHashtags = isSearching
		? (searchData?.search.hashtags ?? [])
		: (hashtagsData?.hashtags ?? []);

	const isLoading = isSearching
		? searchLoading
		: initialUsersLoading || initialPostsLoading || hashtagsLoading;
	const hasError = isSearching
		? searchError
		: initialUsersError || initialPostsError || hashtagsError;

	const displayUsers = activeFilter === "posts" || activeFilter === "hashtags" ? [] : allUsers;
	const displayPosts = activeFilter === "users" || activeFilter === "hashtags" ? [] : allPosts;
	const displayHashtags = activeFilter === "users" || activeFilter === "posts" ? [] : allHashtags;

	const selectedPost =
		selectedPostId !== null ? (allPosts.find((p) => p.id === selectedPostId) ?? null) : null;

	const handleLoadMoreHashtags = () => {
		if (isSearching) {
			const currentLength = searchData?.search.hashtags.length ?? 0;
			fetchMoreSearch({
				variables: {
					query: debouncedSearchQuery,
					usersLimit: 0,
					usersOffset: 0,
					postsLimit: 0,
					postsOffset: 0,
					hashtagsLimit: LOAD_MORE_HASHTAGS_INCREMENT,
					hashtagsOffset: currentLength,
				},
				updateQuery: (prev, { fetchMoreResult }) => {
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
			const currentLength = hashtagsData?.hashtags.length ?? 0;
			fetchMoreHashtags({
				variables: { offset: currentLength, limit: LOAD_MORE_HASHTAGS_INCREMENT },
				updateQuery: (prev, { fetchMoreResult }) => {
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
			const currentLength = searchData?.search.users.length ?? 0;
			fetchMoreSearch({
				variables: {
					query: debouncedSearchQuery,
					usersLimit: LOAD_MORE_USERS_INCREMENT,
					usersOffset: currentLength,
					postsLimit: 0,
					postsOffset: 0,
					hashtagsLimit: 0,
					hashtagsOffset: 0,
				},
				updateQuery: (prev, { fetchMoreResult }) => {
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
			const currentLength = initialUsersData?.users.length ?? 0;
			fetchMoreUsers({
				variables: { offset: currentLength, limit: LOAD_MORE_USERS_INCREMENT },
				updateQuery: (prev, { fetchMoreResult }) => {
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
			const currentLength = searchData?.search.posts.length ?? 0;
			fetchMoreSearch({
				variables: {
					query: debouncedSearchQuery,
					usersLimit: 0,
					usersOffset: 0,
					postsLimit: LOAD_MORE_POSTS_INCREMENT,
					postsOffset: currentLength,
					hashtagsLimit: 0,
					hashtagsOffset: 0,
				},
				updateQuery: (prev, { fetchMoreResult }) => {
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
			const currentLength = initialPostsData?.posts.length ?? 0;
			fetchMorePosts({
				variables: { offset: currentLength, limit: LOAD_MORE_POSTS_INCREMENT },
				updateQuery: (prev, { fetchMoreResult }) => {
					if (!fetchMoreResult) return prev;
					const newItems = fetchMoreResult.posts;
					posts.onFetched(newItems.length, LOAD_MORE_POSTS_INCREMENT);
					return { __typename: "Query", posts: [...prev.posts, ...newItems] };
				},
			});
		}
	};

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

	const loadingMode = isSearching ? searchLoading : initialUsersLoading || initialPostsLoading;

	return (
		<PageFade>
			<div className="max-w-[630px] mx-auto pb-20">
				{/* Search bar with autocomplete */}
				<div className="sticky top-0 z-10 bg-background border-b">
					<div className="p-4">
						<SearchBar
							value={searchQuery}
							onChange={setSearchQuery}
							onClear={() => setSearchQuery("")}
							placeholder="Search users, posts, hashtags..."
							suggestions={
								isSearching
									? {
											users: autocompleteData?.searchAutocomplete.users ?? [],
											posts: autocompleteData?.searchAutocomplete.posts ?? [],
											hashtags: autocompleteData?.searchAutocomplete.hashtags ?? [],
										}
									: undefined
							}
							onSuggestionSelect={setSearchQuery}
						/>
					</div>
					<SearchFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
				</div>

				{/* Results */}
				<div className="mt-2">
					{!isSearching && !isTyping ? (
						<>
							{(activeFilter === "all" || activeFilter === "hashtags") && (
								<SearchResultsSection
									title="Hashtags"
									isEmpty={displayHashtags.length === 0}
									hasMore={hashtags.hasMore}
									loading={hashtagsLoading}
									onLoadMore={handleLoadMoreHashtags}
								>
									<div className="flex flex-col gap-2 px-4">
										{displayHashtags.map((hashtag) => (
											<HashtagSearchResult
												key={hashtag.id}
												hashtag={hashtag}
												onClick={() => handleHashtagClick(hashtag.name)}
											/>
										))}
									</div>
								</SearchResultsSection>
							)}

							{(activeFilter === "all" || activeFilter === "users") && (
								<SearchResultsSection
									title="Users"
									isEmpty={displayUsers.length === 0}
									hasMore={users.hasMore}
									loading={initialUsersLoading}
									onLoadMore={handleLoadMoreUsers}
								>
									<div className="flex flex-col gap-4 px-4">
										{displayUsers.map((user) => (
											<UserSearchResult
												key={user.id}
												user={user}
												onPostClick={handleUserPostClick}
											/>
										))}
									</div>
								</SearchResultsSection>
							)}

							{(activeFilter === "all" || activeFilter === "posts") && (
								<SearchResultsSection
									title="Posts"
									isEmpty={displayPosts.length === 0}
									hasMore={posts.hasMore}
									loading={initialPostsLoading}
									onLoadMore={handleLoadMorePosts}
								>
									<PostGrid posts={displayPosts} onPostClick={handlePostClick} />
								</SearchResultsSection>
							)}
						</>
					) : (
						<>
							{isLoading || isTyping ? (
								<PageFade key="skeleton">
									<div className="px-4 py-8">
										<SearchSkeleton />
									</div>
								</PageFade>
							) : (
								<PageFade key={debouncedSearchQuery}>
									{(activeFilter === "all" || activeFilter === "hashtags") && (
										<SearchResultsSection
											title="Hashtags"
											isEmpty={displayHashtags.length === 0}
											showEmpty
											emptyMessage={`No hashtags found for "${debouncedSearchQuery}"`}
											hasMore={hashtags.hasMore}
											loading={loadingMode}
											onLoadMore={handleLoadMoreHashtags}
										>
											<div className="flex flex-col gap-2 px-4">
												{displayHashtags.map((hashtag) => (
													<HashtagSearchResult
														key={hashtag.id}
														hashtag={hashtag}
														onClick={() => handleHashtagClick(hashtag.name)}
													/>
												))}
											</div>
										</SearchResultsSection>
									)}

									{(activeFilter === "all" || activeFilter === "users") && (
										<SearchResultsSection
											title="Users"
											isEmpty={displayUsers.length === 0}
											showEmpty
											emptyMessage={`No users found for "${debouncedSearchQuery}"`}
											hasMore={users.hasMore}
											loading={loadingMode}
											onLoadMore={handleLoadMoreUsers}
										>
											<div className="space-y-3 px-4">
												{displayUsers.map((user) => (
													<UserSearchResult
														key={user.id}
														user={user}
														onPostClick={handleUserPostClick}
													/>
												))}
											</div>
										</SearchResultsSection>
									)}

									{(activeFilter === "all" || activeFilter === "posts") && (
										<SearchResultsSection
											title="Posts"
											isEmpty={displayPosts.length === 0}
											showEmpty
											emptyMessage={`No posts found for "${debouncedSearchQuery}"`}
											hasMore={posts.hasMore}
											loading={loadingMode}
											onLoadMore={handleLoadMorePosts}
										>
											<div className="space-y-3 px-4">
												{displayPosts.map((post) => (
													<SearchPostCard
														key={post.id}
														post={post}
														onClick={() => handlePostClick(post)}
													/>
												))}
											</div>
										</SearchResultsSection>
									)}
								</PageFade>
							)}
						</>
					)}
				</div>

				{/* Post modal */}
				{selectedPost && (
					<PostModal
						open={!!selectedPost}
						onOpenChange={(open) => {
							if (!open) setSelectedPostId(null);
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
