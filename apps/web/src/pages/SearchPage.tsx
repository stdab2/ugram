import { SearchBar } from "@/components/SearchBar";
import { SearchFilters } from "@/components/SearchFilters";
import { PostModal } from "@/components/PostModal";
import { SearchSkeleton } from "@/components/SearchSkeleton";
import { SearchResultsList } from "@/components/search/SearchResultsList";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/Empty";
import { Button } from "@/components/ui/Button";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { PageFade } from "@/components/PageFade";
import { useSearchState } from "@/hooks/useSearchState";
import { useSearchResults } from "@/hooks/useSearchResults";
import { usePostSelection } from "@/hooks/usePostSelection";
import { useLoadMoreHandlers } from "@/hooks/useLoadMoreHandlers";

export function SearchPage() {
	const {
		searchQuery,
		setSearchQuery,
		activeFilter,
		setActiveFilter,
		debouncedSearchQuery,
		isSearching,
		isTyping,
		handleHashtagClick,
	} = useSearchState();

	// Use search results hook for all query logic
	const {
		hashtagsQuery,
		usersQuery,
		postsQuery,
		searchQuery: searchQueryData,
		autocompleteQuery,
		hashtags,
		users,
		posts,
		allUsers,
		allPosts,
		allHashtags,
		isLoading,
		hasError,
	} = useSearchResults(debouncedSearchQuery, isSearching);

	// Use post selection hook
	const { selectedPost, setSelectedPostId } = usePostSelection(allPosts);

	// Use load more handlers
	const { handleLoadMoreHashtags, handleLoadMoreUsers, handleLoadMorePosts } = useLoadMoreHandlers({
		isSearching,
		debouncedSearchQuery,
		searchQueryData,
		hashtagsQuery,
		usersQuery,
		postsQuery,
		hashtags,
		users,
		posts,
	});

	// Filter displays
	const displayUsers = activeFilter === "posts" || activeFilter === "hashtags" ? [] : allUsers;
	const displayPosts = activeFilter === "users" || activeFilter === "hashtags" ? [] : allPosts;
	const displayHashtags = activeFilter === "users" || activeFilter === "posts" ? [] : allHashtags;

	// Initial loading state
	if (
		(usersQuery.loading || postsQuery.loading) &&
		!usersQuery.data &&
		!postsQuery.data &&
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
								{searchQueryData.error?.message ||
									hashtagsQuery.error?.message ||
									usersQuery.error?.message ||
									postsQuery.error?.message ||
									"Something went wrong"}
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button
								onClick={() => {
									if (isSearching) {
										searchQueryData.refetch();
									} else {
										hashtagsQuery.refetch();
										usersQuery.refetch();
										postsQuery.refetch();
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
											users: autocompleteQuery.data?.searchAutocomplete.users ?? [],
											posts: autocompleteQuery.data?.searchAutocomplete.posts ?? [],
											hashtags: autocompleteQuery.data?.searchAutocomplete.hashtags ?? [],
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
						<SearchResultsList
							isSearching={false}
							isTyping={false}
							isLoading={isLoading}
							debouncedSearchQuery={debouncedSearchQuery}
							activeFilter={activeFilter}
							displayUsers={displayUsers}
							displayPosts={displayPosts}
							displayHashtags={displayHashtags}
							usersHasMore={users.hasMore}
							postsHasMore={posts.hasMore}
							hashtagsHasMore={hashtags.hasMore}
							onLoadMoreUsers={handleLoadMoreUsers}
							onLoadMorePosts={handleLoadMorePosts}
							onLoadMoreHashtags={handleLoadMoreHashtags}
							onPostClick={(post) => setSelectedPostId(Number(post.id))}
							onHashtagClick={handleHashtagClick}
							onUserClick={(postId) => setSelectedPostId(Number(postId))}
						/>
					) : isLoading || isTyping ? (
						<PageFade key="skeleton">
							<div className="px-4 py-8">
								<SearchSkeleton />
							</div>
						</PageFade>
					) : (
						<PageFade key={debouncedSearchQuery}>
							<SearchResultsList
								isSearching={true}
								isTyping={false}
								isLoading={isLoading}
								debouncedSearchQuery={debouncedSearchQuery}
								activeFilter={activeFilter}
								displayUsers={displayUsers}
								displayPosts={displayPosts}
								displayHashtags={displayHashtags}
								usersHasMore={users.hasMore}
								postsHasMore={posts.hasMore}
								hashtagsHasMore={hashtags.hasMore}
								onLoadMoreUsers={handleLoadMoreUsers}
								onLoadMorePosts={handleLoadMorePosts}
								onLoadMoreHashtags={handleLoadMoreHashtags}
								onPostClick={(post) => setSelectedPostId(Number(post.id))}
								onHashtagClick={handleHashtagClick}
								onUserClick={(postId) => setSelectedPostId(Number(postId))}
							/>
						</PageFade>
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
								searchQueryData.refetch();
							} else {
								postsQuery.refetch();
							}
						}}
					/>
				)}
			</div>
		</PageFade>
	);
}
