import { SearchResultsSection } from "@/components/search/SearchResultsSection";
import { UserSearchResult } from "@/components/UserSearchResult";
import { HashtagSearchResult } from "@/components/HashtagSearchResult";
import { SearchPostCard } from "@/components/search/SearchPostCard";
import { getImageUrl } from "@/lib/utils";
import type { HashtagType, UserType, PostType } from "@/types";

interface SearchResultsListProps {
	isSearching: boolean;
	isTyping: boolean;
	isLoading: boolean;
	debouncedSearchQuery: string;
	activeFilter: string;

	// Display data
	displayUsers: UserType[];
	displayPosts: PostType[];
	displayHashtags: HashtagType[];

	// Load more state
	usersHasMore: boolean;
	postsHasMore: boolean;
	hashtagsHasMore: boolean;

	// Callbacks
	onLoadMoreUsers: () => void;
	onLoadMorePosts: () => void;
	onLoadMoreHashtags: () => void;
	onPostClick: (post: PostType) => void;
	onHashtagClick: (hashtagName: string) => void;
	onUserClick: (postId: string | number) => void;
}

export function SearchResultsList({
	isSearching,
	isTyping,
	isLoading,
	debouncedSearchQuery,
	activeFilter,
	displayUsers,
	displayPosts,
	displayHashtags,
	usersHasMore,
	postsHasMore,
	hashtagsHasMore,
	onLoadMoreUsers,
	onLoadMorePosts,
	onLoadMoreHashtags,
	onPostClick,
	onHashtagClick,
	onUserClick,
}: SearchResultsListProps) {
	// Determine if we should show empty messages
	const showEmptyMessages = isSearching && !isLoading && !isTyping;

	return (
		<>
			{/* Hashtags Section */}
			{(activeFilter === "all" || activeFilter === "hashtags") && (
				<SearchResultsSection
					title="Hashtags"
					isEmpty={displayHashtags.length === 0}
					hasMore={hashtagsHasMore}
					loading={isLoading}
					showEmpty={showEmptyMessages}
					emptyMessage={
						showEmptyMessages ? `No hashtags found for "${debouncedSearchQuery}"` : undefined
					}
					onLoadMore={onLoadMoreHashtags}
				>
					<div className="flex flex-col gap-2 px-4">
						{displayHashtags.map((hashtag) => (
							<HashtagSearchResult
								key={hashtag.id}
								hashtag={hashtag}
								onClick={() => onHashtagClick(hashtag.name)}
							/>
						))}
					</div>
				</SearchResultsSection>
			)}

			{/* Users Section */}
			{(activeFilter === "all" || activeFilter === "users") && (
				<SearchResultsSection
					title="Users"
					isEmpty={displayUsers.length === 0}
					hasMore={usersHasMore}
					loading={isLoading}
					showEmpty={showEmptyMessages}
					emptyMessage={
						showEmptyMessages ? `No users found for "${debouncedSearchQuery}"` : undefined
					}
					onLoadMore={onLoadMoreUsers}
				>
					<div className={isSearching && !isTyping ? "space-y-3 px-4" : "flex flex-col gap-4 px-4"}>
						{displayUsers.map((user) => (
							<UserSearchResult key={user.id} user={user} onPostClick={onUserClick} />
						))}
					</div>
				</SearchResultsSection>
			)}

			{/* Posts Section */}
			{(activeFilter === "all" || activeFilter === "posts") && (
				<SearchResultsSection
					title="Posts"
					isEmpty={displayPosts.length === 0}
					hasMore={postsHasMore}
					loading={isLoading}
					showEmpty={showEmptyMessages}
					emptyMessage={
						showEmptyMessages ? `No posts found for "${debouncedSearchQuery}"` : undefined
					}
					onLoadMore={onLoadMorePosts}
				>
					<div className={isSearching && !isTyping ? "space-y-3 px-4" : ""}>
						{isSearching && !isTyping ? (
							// Search results view: card layout
							displayPosts.map((post) => (
								<SearchPostCard key={post.id} post={post} onClick={() => onPostClick(post)} />
							))
						) : (
							// Initial state view: grid layout
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
									gap: "1rem",
									padding: "0 1rem",
								}}
							>
								{displayPosts.map((post) => (
									<div
										key={post.id}
										className="cursor-pointer rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
										onClick={() => onPostClick(post)}
									>
										<img
											src={getImageUrl(post.imageUrl)}
											alt={post.description}
											className="w-full aspect-square object-cover"
										/>
									</div>
								))}
							</div>
						)}
					</div>
				</SearchResultsSection>
			)}
		</>
	);
}
