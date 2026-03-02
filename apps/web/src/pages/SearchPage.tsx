import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { SearchFilters } from "@/components/SearchFilters";
import { UserSearchResult } from "@/components/UserSearchResult";
import { HashtagSearchResult } from "@/components/HashtagSearchResult";
import { PostGrid } from "@/components/PostGrid";
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
import { useUsersQuery, usePostsQuery, useSearchQuery, usePopularHashtagsQuery } from "@/generated/graphql";
import type { PostsQuery } from "@/generated/graphql";
import { PageFade } from "@/components/PageFade";
import { useDebounce } from "@/hooks/use-debounce";

const USERS_PER_PAGE = 10;
const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

export function SearchPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeFilter, setActiveFilter] = useState<SearchType>("all");
	const [selectedPost, setSelectedPost] = useState<PostsQuery["posts"][0] | null>(null);

	// Debounce search query
	const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);
	const isSearching = debouncedSearchQuery.trim().length >= MIN_SEARCH_LENGTH;

	// Fetch popular hashtags for default view
	const {
		data: popularHashtagsData,
		loading: popularHashtagsLoading,
		error: popularHashtagsError,
	} = usePopularHashtagsQuery({
		variables: { limit: 3 },
		skip: isSearching,
	});

	// Fetch initial users for "Recent" section
	const {
		data: initialUsersData,
		loading: initialUsersLoading,
		error: initialUsersError,
		refetch: refetchInitialUsers,
	} = useUsersQuery({
		variables: {
			limit: USERS_PER_PAGE,
			offset: 0,
		},
		skip: isSearching,
	});

	// Fetch initial posts for "Recent" section
	const {
		data: initialPostsData,
		loading: initialPostsLoading,
		error: initialPostsError,
		refetch: refetchInitialPosts,
	} = usePostsQuery({
		variables: { limit: 30, offset: 0 },
		skip: isSearching,
	});

	// Unified search query
	const {
		data: searchData,
		loading: searchLoading,
		error: searchError,
		refetch: refetchSearch,
	} = useSearchQuery({
		variables: {
			query: debouncedSearchQuery,
			limit: 30,
			offset: 0,
		},
		skip: !isSearching,
	});

	// Determine which data to use
	const allUsers = isSearching ? searchData?.search.users || [] : initialUsersData?.users || [];
	const allPosts = isSearching ? searchData?.search.posts || [] : initialPostsData?.posts || [];
	const allHashtags = isSearching ? searchData?.search.hashtags || [] : [];

	const isLoading = isSearching ? searchLoading : initialUsersLoading || initialPostsLoading;
	const hasError = isSearching ? searchError : initialUsersError || initialPostsError;

	// Show loading only on initial load
	if ((initialUsersLoading || initialPostsLoading) && !initialUsersData && !initialPostsData && !isSearching) {
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
				<div className="max-w-[630px] mx-auto pb-20 flex items-center justify-center min-h-[60vh]">
					<Empty>
						<EmptyHeader>
							<AlertCircle className="h-12 w-12 mb-4 text-muted-foreground" />
							<EmptyTitle>Unable to Load Search</EmptyTitle>
							<EmptyDescription>
								{(searchError?.message || initialUsersError?.message || initialPostsError?.message) || "Something went wrong"}
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button
								onClick={() => {
									if (isSearching) {
										refetchSearch();
									} else {
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

	const handlePostClick = (post: {
		id: string | number;
		imageUrl: string;
		likes?: number;
		comments?: number;
	}) => {
		const fullPost = allPosts.find((p) => p.id === post.id);
		if (fullPost) {
			setSelectedPost(fullPost);
		}
	};

	const handleUserPostClick = (postId: string | number) => {
		const fullPost = allPosts.find((p) => p.id === postId);
		if (fullPost) {
			setSelectedPost(fullPost);
		}
	};

	// Show typing indicator when user is typing but debounce hasn't triggered yet
	const isTyping = searchQuery.trim().length >= MIN_SEARCH_LENGTH && searchQuery !== debouncedSearchQuery;

	// Filter users and posts based on active filter
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
							onChange={setSearchQuery}
							onClear={() => setSearchQuery("")}
							placeholder="Search users, posts, hashtags..."
						/>
						{/* Typing indicator */}
						{isTyping && (
							<p className="text-xs text-muted-foreground mt-2">Searching...</p>
						)}
					</div>
					<SearchFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
				</div>

				{/* Content */}
				<div className="mt-2">
					{!isSearching ? (
						<>
							{/* Popular Hashtags - Only show when filter is "all" or "hashtags" */}
							{(activeFilter === "all" || activeFilter === "hashtags") && (
								<div className="mb-6">
									<div className="px-4 py-3">
										<h2 className="font-semibold">Popular Hashtags</h2>
									</div>
									<div className="flex flex-col gap-2 px-4">
										{popularHashtagsData?.popularHashtags.map((hashtag) => (
											<HashtagSearchResult
												key={hashtag.id}
												hashtag={hashtag}
												onClick={() => {
													setSearchQuery(hashtag.name);
													setActiveFilter("posts");
												}}
											/>
										))}
									</div>
								</div>
							)}

							{/* Users List */}
							{(activeFilter === "all" || activeFilter === "users") && (
								<div className="mb-6">
									<div className="px-4 py-3">
										<h2 className="font-semibold">Users</h2>
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
								</div>
							)}

							{/* Random Posts */}
							{(activeFilter === "all" || activeFilter === "posts") && (
								<div>
									<div className="px-4 py-3">
										<h2 className="font-semibold">Posts</h2>
									</div>
									<PostGrid posts={displayPosts} onPostClick={handlePostClick} />
								</div>
							)}
						</>
					) : (
						<>
							{/* Search Results with Loading State */}
							{isLoading ? (
								<div className="px-4 py-8">
									<SearchSkeleton />
								</div>
							) : (
								<>
									{/* Users Results */}
									{(activeFilter === "all" || activeFilter === "users") && (
										<div className="mb-6">
											<div className="px-4 py-3">
												<h2 className="font-semibold">Users</h2>
											</div>
											{displayUsers.length > 0 ? (
												<div className="space-y-3 px-4">
													{displayUsers.map((user) => (
														<UserSearchResult
															key={user.id}
															user={user}
															onPostClick={handleUserPostClick}
														/>
													))}
												</div>
											) : (
												<p className="px-4 py-8 text-center text-muted-foreground">
													No users found for "{debouncedSearchQuery}"
												</p>
											)}
										</div>
									)}

									{/* Hashtags Results */}
									{(activeFilter === "all" || activeFilter === "hashtags") && (
										<div className="mb-6">
											<div className="px-4 py-3">
												<h2 className="font-semibold">Hashtags</h2>
											</div>
											{displayHashtags.length > 0 ? (
												<div className="flex flex-col gap-2 px-4">
													{displayHashtags.map((hashtag) => (
														<HashtagSearchResult
															key={hashtag.id}
															hashtag={hashtag}
															onClick={() => {
																// Filtrer les posts par ce hashtag
																setSearchQuery(hashtag.name);
																setActiveFilter("posts");
															}}
														/>
													))}
												</div>
											) : (
												<p className="px-4 py-8 text-center text-muted-foreground">
													No hashtags found for "{debouncedSearchQuery}"
												</p>
											)}
										</div>
									)}

									{/* Posts Results */}
									{(activeFilter === "all" || activeFilter === "posts") && (
										<div>
											<div className="px-4 py-3">
												<h2 className="font-semibold">Posts</h2>
											</div>
											{displayPosts.length > 0 ? (
												<PostGrid posts={displayPosts} onPostClick={handlePostClick} />
											) : (
												<p className="px-4 py-8 text-center text-muted-foreground">
													No posts found for "{debouncedSearchQuery}"
												</p>
											)}
										</div>
									)}
					</>
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
					setSelectedPost(null);
				}
			}}
			post={selectedPost}
			onPostDeletion={() => {
				setSelectedPost(null);
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
