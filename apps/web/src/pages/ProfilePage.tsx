import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { PostModal } from "@/components/PostModal";
import { ProfileSkeleton } from "@/components/ProfileSkeleton";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/Empty";
import {
	useUserByUserNameQuery,
	useDeletePostMutation,
	useFollowUserMutation,
	useUnfollowUserMutation,
	useFollowersQuery,
	useFollowingQuery,
	usePostsByAuthorQuery,
} from "@/generated/graphql";
import { UserX, AlertCircle } from "lucide-react";
import { useState } from "react";
import { PageFade } from "@/components/PageFade";
import { toast } from "sonner";
import { useAuth } from "@/AuthContext";
import { ProfileHeaderCard } from "@/components/ProfileHeaderCard";
import { ProfileContentPanel } from "@/components/ProfileContentPanel";
import type { ProfileView, FollowListUser } from "@/components/ProfileContentTypes";

const PROFILE_LIST_PAGE_SIZE = 6;

type ProfileUiState = {
	userName: string;
	activeView: ProfileView;
	selectedPostId: number | null;
};

type OptimisticFollowState = {
	targetUserId: number | null;
	isFollowed: boolean | null;
	followerDelta: number;
	followersList: FollowListUser[] | null;
};

type HasMoreState = {
	userName: string;
	posts: boolean;
	followers: boolean;
	following: boolean;
};

export function ProfilePage() {
	const { username } = useParams();
	const navigate = useNavigate();
	const { userAuth } = useAuth();

	const userNameToFetch = username === "me" || !username ? userAuth!.userName : username;

	const isOwnProfile = userNameToFetch === userAuth!.userName;
	const [profileUiState, setProfileUiState] = useState<ProfileUiState>({
		userName: userNameToFetch,
		activeView: "posts",
		selectedPostId: null,
	});
	const [optimisticFollowState, setOptimisticFollowState] = useState<OptimisticFollowState>({
		targetUserId: null,
		isFollowed: null,
		followerDelta: 0,
		followersList: null,
	});
	const [hasMoreState, setHasMoreState] = useState<HasMoreState>({
		userName: userNameToFetch,
		posts: true,
		followers: true,
		following: true,
	});

	const isCurrentProfileState = profileUiState.userName === userNameToFetch;
	const isCurrentHasMoreState = hasMoreState.userName === userNameToFetch;
	const activeView = isCurrentProfileState ? profileUiState.activeView : "posts";
	const selectedPostId = isCurrentProfileState ? profileUiState.selectedPostId : null;

	const setHasMoreForView = (view: "posts" | "followers" | "following", hasMore: boolean) => {
		setHasMoreState((prev) => {
			if (prev.userName !== userNameToFetch) {
				return {
					userName: userNameToFetch,
					posts: view === "posts" ? hasMore : true,
					followers: view === "followers" ? hasMore : true,
					following: view === "following" ? hasMore : true,
				};
			}

			return {
				...prev,
				[view]: hasMore,
			};
		});
	};

	const handleChangeView = (view: ProfileView) => {
		setProfileUiState((prev) => ({
			userName: userNameToFetch,
			activeView: view,
			selectedPostId: prev.userName === userNameToFetch ? prev.selectedPostId : null,
		}));
	};

	const handleSelectPost = (postId: number | null) => {
		setProfileUiState((prev) => ({
			userName: userNameToFetch,
			activeView: prev.userName === userNameToFetch ? prev.activeView : "posts",
			selectedPostId: postId,
		}));
	};

	const {
		data: userData,
		loading: userLoading,
		error: userError,
	} = useUserByUserNameQuery({
		variables: { userName: userNameToFetch },
	});

	const viewedUserId = userData?.userByUserName?.id;

	const {
		data: postsData,
		loading: postsLoading,
		fetchMore: fetchMorePosts,
	} = usePostsByAuthorQuery({
		variables: { authorId: viewedUserId ?? 0, limit: PROFILE_LIST_PAGE_SIZE, offset: 0 },
		skip: !viewedUserId || activeView !== "posts",
		onCompleted: (data) => {
			setHasMoreForView("posts", data.postsByAuthor.length === PROFILE_LIST_PAGE_SIZE);
		},
	});

	const {
		data: followersData,
		loading: followersLoading,
		fetchMore: fetchMoreFollowers,
		refetch: refetchFollowers,
	} = useFollowersQuery({
		variables: { userId: viewedUserId ?? 0, limit: PROFILE_LIST_PAGE_SIZE, offset: 0 },
		skip: !viewedUserId || activeView !== "followers",
		onCompleted: (data) => {
			setHasMoreForView("followers", data.followers.length === PROFILE_LIST_PAGE_SIZE);
		},
	});

	const {
		data: followingData,
		loading: followingLoading,
		fetchMore: fetchMoreFollowing,
		refetch: refetchFollowing,
	} = useFollowingQuery({
		variables: { userId: viewedUserId ?? 0, limit: PROFILE_LIST_PAGE_SIZE, offset: 0 },
		skip: !viewedUserId || activeView !== "following",
		onCompleted: (data) => {
			setHasMoreForView("following", data.following.length === PROFILE_LIST_PAGE_SIZE);
		},
	});

	const [deletePost] = useDeletePostMutation({
		update(cache, { data }) {
			if (!data?.deletePost) return;

			cache.evict({ id: cache.identify({ __typename: "Post", id: data.deletePost.id }) });
			cache.gc();
		},
	});

	const [followUser, { loading: followLoading }] = useFollowUserMutation();
	const [unfollowUser, { loading: unfollowLoading }] = useUnfollowUserMutation();

	const currentPosts = postsData?.postsByAuthor ?? [];
	const currentFollowers = followersData?.followers ?? [];
	const currentFollowing = followingData?.following ?? [];
	const isOptimisticForViewedUser =
		viewedUserId !== undefined && optimisticFollowState.targetUserId === viewedUserId;
	const hasRealFollowersData = followersData !== undefined;
	const displayedFollowers =
		isOptimisticForViewedUser &&
		optimisticFollowState.followersList !== null &&
		!hasRealFollowersData
			? optimisticFollowState.followersList
			: currentFollowers;
	const isViewLoading =
		(activeView === "posts" && postsLoading && !postsData) ||
		(activeView === "followers" && followersLoading && !followersData) ||
		(activeView === "following" && followingLoading && !followingData);
	const hasMorePosts = isCurrentHasMoreState ? hasMoreState.posts : true;
	const hasMoreFollowers = isCurrentHasMoreState ? hasMoreState.followers : true;
	const hasMoreFollowing = isCurrentHasMoreState ? hasMoreState.following : true;

	const handlePostDeletion = async (postId: number) => {
		try {
			await deletePost({ variables: { id: postId } });
			handleSelectPost(null);
			toast.success("Your post has been successfully deleted!");
		} catch {
			// Already handled
		}
	};

	const handleFollowToggle = async (targetUserId: number, isCurrentlyFollowing: boolean) => {
		const previousOptimisticFollowState = optimisticFollowState;
		const followerDelta = isCurrentlyFollowing ? -1 : 1;
		const canBuildFollowersList =
			followersData !== undefined ||
			(previousOptimisticFollowState.targetUserId === targetUserId &&
				previousOptimisticFollowState.followersList !== null);

		setOptimisticFollowState((prev) => {
			const isSameTarget = prev.targetUserId === targetUserId;
			const baseFollowersList = isSameTarget ? prev.followersList : null;
			const source = baseFollowersList ?? (canBuildFollowersList ? currentFollowers : null);
			const nextFollowerDelta = (isSameTarget ? prev.followerDelta : 0) + followerDelta;
			let nextFollowersList = source;

			if (userAuth && source !== null) {
				const currentUserListEntry: FollowListUser = {
					id: userAuth.id,
					userName: userAuth.userName,
					firstName: userAuth.firstName,
					lastName: userAuth.lastName,
					picture: userAuth.profilePictureUrl ?? null,
				};

				if (isCurrentlyFollowing) {
					nextFollowersList = source.filter((follower) => follower.id !== currentUserListEntry.id);
				} else if (!source.some((follower) => follower.id === currentUserListEntry.id)) {
					nextFollowersList = [currentUserListEntry, ...source];
				}
			}

			return {
				targetUserId,
				isFollowed: !isCurrentlyFollowing,
				followerDelta: nextFollowerDelta,
				followersList: nextFollowersList ?? null,
			};
		});

		try {
			if (isCurrentlyFollowing) {
				await unfollowUser({ variables: { userId: targetUserId } });
				toast.success("User unfollowed.");
			} else {
				await followUser({ variables: { userId: targetUserId } });
				toast.success("User followed.");
			}

			if (isOwnProfile) {
				await refetchFollowing();
			} else {
				await refetchFollowers();
			}

			setOptimisticFollowState((prev) =>
				prev.targetUserId !== targetUserId
					? prev
					: {
							...prev,
							followersList: null,
						}
			);
		} catch {
			setOptimisticFollowState(previousOptimisticFollowState);
		}
	};

	const handleLoadMorePosts = () => {
		if (!viewedUserId || !hasMorePosts) return;

		const currentLength = currentPosts.length;

		fetchMorePosts({
			variables: {
				authorId: viewedUserId,
				limit: PROFILE_LIST_PAGE_SIZE,
				offset: currentLength,
			},
			updateQuery: (prev, { fetchMoreResult }) => {
				if (!fetchMoreResult) return prev;
				const newPosts = fetchMoreResult.postsByAuthor;
				setHasMoreForView("posts", newPosts.length === PROFILE_LIST_PAGE_SIZE);
				return {
					__typename: "Query",
					postsByAuthor: [...prev.postsByAuthor, ...newPosts],
				};
			},
		});
	};

	const handleLoadMoreFollowers = () => {
		if (!viewedUserId || !hasMoreFollowers) return;

		const currentLength = currentFollowers.length;

		fetchMoreFollowers({
			variables: {
				userId: viewedUserId,
				limit: PROFILE_LIST_PAGE_SIZE,
				offset: currentLength,
			},
			updateQuery: (prev, { fetchMoreResult }) => {
				if (!fetchMoreResult) return prev;
				const newFollowers = fetchMoreResult.followers;
				setHasMoreForView("followers", newFollowers.length === PROFILE_LIST_PAGE_SIZE);
				return {
					__typename: "Query",
					followers: [...prev.followers, ...newFollowers],
				};
			},
		});
	};

	const handleLoadMoreFollowing = () => {
		if (!viewedUserId || !hasMoreFollowing) return;
		const currentLength = currentFollowing.length;
		fetchMoreFollowing({
			variables: {
				userId: viewedUserId,
				limit: PROFILE_LIST_PAGE_SIZE,
				offset: currentLength,
			},
			updateQuery: (prev, { fetchMoreResult }) => {
				if (!fetchMoreResult) return prev;

				const newFollowing = fetchMoreResult.following;
				setHasMoreForView("following", newFollowing.length === PROFILE_LIST_PAGE_SIZE);

				return {
					__typename: "Query",
					following: [...prev.following, ...newFollowing],
				};
			},
		});
	};

	if (userLoading) {
		return (
			<PageFade key="loading" delay={0.3}>
				<ProfileSkeleton />
			</PageFade>
		);
	}

	if (userError) {
		return (
			<PageFade key="error">
				<div className="w-full min-h-screen bg-background flex items-center justify-center p-4">
					<Empty>
						<EmptyHeader>
							<AlertCircle className="h-12 w-12 mb-4 text-muted-foreground" />
							<EmptyTitle>Error Loading Profile</EmptyTitle>
							<EmptyDescription>{userError?.message || "Something went wrong"}</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button onClick={() => navigate("/")}>Go back to feed</Button>
						</EmptyContent>
					</Empty>
				</div>
			</PageFade>
		);
	}

	if (!userData?.userByUserName) {
		return (
			<PageFade key="not-found">
				<div className="w-full min-h-screen bg-background flex items-center justify-center p-4">
					<Empty>
						<EmptyHeader>
							<UserX className="h-12 w-12 mb-4 text-muted-foreground" />
							<EmptyTitle>User Not Found</EmptyTitle>
							<EmptyDescription>
								The user you&apos;re looking for doesn&apos;t exist or has been removed.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button onClick={() => navigate("/")}>Go back to feed</Button>
						</EmptyContent>
					</Empty>
				</div>
			</PageFade>
		);
	}

	const user = userData.userByUserName;
	const displayedIsFollowedByCurrentUser =
		isOptimisticForViewedUser && optimisticFollowState.isFollowed !== null
			? optimisticFollowState.isFollowed
			: user.isFollowedByCurrentUser;
	const displayedFollowerCount = Math.max(
		0,
		user.followerCount + (isOptimisticForViewedUser ? optimisticFollowState.followerDelta : 0)
	);

	const selectedPost =
		selectedPostId !== null ? (currentPosts.find((p) => p.id === selectedPostId) ?? null) : null;
	const isFollowActionLoading = followLoading || unfollowLoading;

	return (
		<PageFade key="content">
			<div className="w-full min-h-screen bg-background pb-20 md:pb-0">
				<div className="max-w-5xl mx-auto px-4 py-8">
					<ProfileHeaderCard
						user={user}
						isOwnProfile={isOwnProfile}
						activeView={activeView}
						displayedIsFollowedByCurrentUser={displayedIsFollowedByCurrentUser}
						displayedFollowerCount={displayedFollowerCount}
						followingCount={user.followingCount}
						isFollowActionLoading={isFollowActionLoading}
						onOpenSettings={() => navigate("/settings")}
						onToggleFollow={() => handleFollowToggle(user.id, displayedIsFollowedByCurrentUser)}
						onChangeView={handleChangeView}
					/>

					{isViewLoading ? (
						<ProfileSkeleton />
					) : (
						<ProfileContentPanel
							activeView={activeView}
							posts={currentPosts}
							followers={displayedFollowers}
							following={currentFollowing}
							viewStates={{
								posts: {
									loading: postsLoading,
									hasMore: hasMorePosts,
									onLoadMore: handleLoadMorePosts,
								},
								followers: {
									loading: followersLoading,
									hasMore: hasMoreFollowers,
									onLoadMore: handleLoadMoreFollowers,
								},
								following: {
									loading: followingLoading,
									hasMore: hasMoreFollowing,
									onLoadMore: handleLoadMoreFollowing,
								},
							}}
							onSelectPost={(postId) => handleSelectPost(postId)}
							onOpenProfile={(userName) => navigate(`/profile/${userName}`)}
						/>
					)}

					{/* Post Modal */}
					{activeView === "posts" && selectedPost && (
						<PostModal
							key={selectedPost.id}
							open={!!selectedPost}
							onOpenChange={(open) => !open && handleSelectPost(null)}
							post={{
								...selectedPost,
								author: user,
							}}
							onPostDeletion={handlePostDeletion}
						/>
					)}
				</div>
			</div>
		</PageFade>
	);
}
