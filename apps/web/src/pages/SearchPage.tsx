import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { SearchFilters } from "@/components/SearchFilters";
import { RecentSearchItem } from "@/components/RecentSearchItem";
import { UserSearchResult } from "@/components/UserSearchResult";
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
import type { RecentSearch, SearchType } from "@/types/search";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { useUsersQuery, usePostsQuery } from "@/generated/graphql";
import type { PostsQuery } from "@/generated/graphql";
import { PageFade } from "@/components/PageFade";

// Mock data for recent searches (localStorage à implémenter plus tard)
const mockRecentSearches: RecentSearch[] = [
	{ id: "1", query: "nature", type: "hashtag", timestamp: new Date() },
	{ id: "2", query: "john_doe", type: "user", timestamp: new Date() },
	{ id: "3", query: "sunset", type: "general", timestamp: new Date() },
];

const USERS_PER_PAGE = 10;

export function SearchPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeFilter, setActiveFilter] = useState<SearchType>("all");
	const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(mockRecentSearches);
	const [usersPage, setUsersPage] = useState(0);
	const [selectedPost, setSelectedPost] = useState<PostsQuery["posts"][0] | null>(null);

	// Fetch users with pagination
	const {
		data: usersData,
		loading: usersLoading,
		error: usersError,
		refetch: refetchUsers,
		fetchMore: fetchMoreUsers,
	} = useUsersQuery({
		variables: {
			limit: USERS_PER_PAGE,
			offset: 0,
		},
	});

	// Fetch posts
	const {
		data: postsData,
		loading: postsLoading,
		error: postsError,
		refetch: refetchPosts,
	} = usePostsQuery({
		variables: { limit: 30, offset: 0 },
	});

	const allUsers = usersData?.users || [];
	const allPosts = postsData?.posts || [];

	const isSearching = searchQuery.trim().length > 0;
	const isLoading = usersLoading || postsLoading;
	const hasError = usersError || postsError;

	// Loading state
	if (isLoading && !usersData && !postsData) {
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
								{usersError?.message || postsError?.message || "Something went wrong"}
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button
								onClick={() => {
									refetchUsers();
									refetchPosts();
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

	const handleLoadMoreUsers = async () => {
		const nextPage = usersPage + 1;
		await fetchMoreUsers({
			variables: {
				limit: USERS_PER_PAGE,
				offset: nextPage * USERS_PER_PAGE,
			},
			updateQuery: (prev, { fetchMoreResult }) => {
				if (!fetchMoreResult) return prev;
				return {
					...prev,
					users: [...prev.users, ...fetchMoreResult.users],
				};
			},
		});
		setUsersPage(nextPage);
	};

	const handleDeleteRecentSearch = (id: string) => {
		setRecentSearches((prev) => prev.filter((search) => search.id !== id));
	};

	const handleRecentSearchClick = (query: string) => {
		setSearchQuery(query);
	};

	const handlePostClick = (post: {
		id: string | number;
		imageUrl: string;
		likes?: number;
		comments?: number;
	}) => {
		// Find the full post data from allPosts
		const fullPost = allPosts.find((p) => p.id === post.id);
		if (fullPost) {
			setSelectedPost(fullPost);
		}
	};

	const handleUserPostClick = (postId: string | number) => {
		// Find post from any user's posts
		for (const user of allUsers) {
			const post = user.posts?.find((p) => p.id === postId);
			if (post) {
				// Convert to full post format for modal
				const fullPost = allPosts.find((p) => p.id === postId);
				if (fullPost) {
					setSelectedPost(fullPost);
				}
				break;
			}
		}
	};

	// Filter users based on search
	const filteredUsers = isSearching
		? allUsers.filter(
				(user) =>
					user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
					`${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
			)
		: allUsers;

	const hasMoreUsers = allUsers.length >= (usersPage + 1) * USERS_PER_PAGE;

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
					</div>
					<SearchFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
				</div>

				{/* Content */}
				<div className="mt-2">
					{!isSearching ? (
						<>
							{/* Recent Searches - Only show when filter is "all" */}
							{recentSearches.length > 0 && activeFilter === "all" && (
								<div className="mb-6">
									<div className="flex items-center justify-between px-4 py-3">
										<h2 className="font-semibold">Recent</h2>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setRecentSearches([])}
											className="text-sm text-indigo-400 hover:text-indigo-300"
										>
											Clear all
										</Button>
									</div>
									<div>
										{recentSearches.map((search) => (
											<RecentSearchItem
												key={search.id}
												search={search}
												onClick={() => handleRecentSearchClick(search.query)}
												onDelete={() => handleDeleteRecentSearch(search.id)}
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
										{filteredUsers.map((user) => (
											<UserSearchResult
												key={user.id}
												user={user}
												onPostClick={handleUserPostClick}
											/>
										))}
									</div>
									{hasMoreUsers && (
										<div className="px-4 py-3">
											<Button
												variant="ghost"
												onClick={handleLoadMoreUsers}
												disabled={usersLoading}
												className="w-full text-indigo-400 hover:text-indigo-300"
											>
												{usersLoading ? "Loading..." : "See more users"}
											</Button>
										</div>
									)}
								</div>
							)}

							{/* Random Posts */}
							{(activeFilter === "all" || activeFilter === "posts") && (
								<div>
									<div className="px-4 py-3">
										<h2 className="font-semibold">Posts</h2>
									</div>
									<PostGrid posts={allPosts} onPostClick={handlePostClick} />
								</div>
							)}
						</>
					) : (
						<>
							{/* Search Results */}
							{(activeFilter === "all" || activeFilter === "users") && (
								<div className="mb-6">
									<div className="px-4 py-3">
										<h2 className="font-semibold">Users</h2>
									</div>
									{filteredUsers.length > 0 ? (
										<div className="space-y-3 px-4">
											{filteredUsers.map((user) => (
												<UserSearchResult
													key={user.id}
													user={user}
													onPostClick={handleUserPostClick}
												/>
											))}
										</div>
									) : (
										<p className="px-4 py-8 text-center text-muted-foreground">No users found</p>
									)}
								</div>
							)}

							{(activeFilter === "all" || activeFilter === "posts") && (
								<div>
									<div className="px-4 py-3">
										<h2 className="font-semibold">Posts</h2>
									</div>
									<PostGrid posts={allPosts} onPostClick={handlePostClick} />
								</div>
							)}
						</>
					)}
				</div>

				{/* Post Modal */}
				{selectedPost && (
					<PostModal
						open={!!selectedPost}
						onOpenChange={(open) => !open && setSelectedPost(null)}
						post={selectedPost}
					/>
				)}
			</div>
		</PageFade>
	);
}
