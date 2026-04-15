import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { PostGrid } from "@/components/PostGrid";
import type { PostsByAuthorQuery } from "@/generated/graphql";
import { getImageUrl } from "@/lib/utils";
import type { FollowListUser, ProfileView } from "./ProfileContentTypes";

type ProfilePost = PostsByAuthorQuery["postsByAuthor"][number];

interface ViewState {
	loading: boolean;
	hasMore: boolean;
	onLoadMore: () => void;
}

interface ProfileContentPanelProps {
	activeView: ProfileView;
	posts: ProfilePost[];
	followers: FollowListUser[];
	following: FollowListUser[];
	viewStates: {
		posts: ViewState;
		followers: ViewState;
		following: ViewState;
	};
	onSelectPost: (postId: number) => void;
	onOpenProfile: (userName: string) => void;
}

export function ProfileContentPanel({
	activeView,
	posts,
	followers,
	following,
	viewStates,
	onSelectPost,
	onOpenProfile,
}: ProfileContentPanelProps) {
	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold">
					{activeView === "posts" && "Posts"}
					{activeView === "followers" && "Followers"}
					{activeView === "following" && "Following"}
				</h2>
				<Badge variant="secondary">
					{activeView === "posts" && `${posts.length} posts`}
					{activeView === "followers" && `${followers.length} followers`}
					{activeView === "following" && `${following.length} following`}
				</Badge>
			</div>

			{activeView === "posts" && (
				<>
					<PostGrid
						posts={posts.map((post) => ({
							id: post.id,
							imageUrl: post.imageUrl || "",
							likeCount: post.likeCount,
							isLikedByCurrentUser: post.isLikedByCurrentUser,
							messageCount: post.messageCount,
						}))}
						onPostClick={(postPreview) => onSelectPost(Number(postPreview.id))}
					/>
					{viewStates.posts.hasMore && (
						<div className="mt-4 flex justify-center">
							<Button
								variant="ghost"
								onClick={viewStates.posts.onLoadMore}
								disabled={viewStates.posts.loading}
							>
								{viewStates.posts.loading ? "Loading..." : "See more posts"}
							</Button>
						</div>
					)}
				</>
			)}

			{activeView === "followers" && (
				<>
					<div className="flex flex-col gap-3">
						{followers.length > 0 ? (
							followers.map((follower) => (
								<Button
									key={follower.id}
									variant="outline"
									className="justify-start gap-2"
									onClick={() => onOpenProfile(follower.userName)}
								>
									<Avatar className="h-6 w-6">
										<AvatarImage src={getImageUrl(follower.picture)} />
										<AvatarFallback className="text-[10px]">
											{follower.firstName[0] + follower.lastName[0]}
										</AvatarFallback>
									</Avatar>
									<p className="text-md">
										{follower.firstName} {follower.lastName}
									</p>
									<p className="text-gray-500 text-sm">@{follower.userName}</p>
								</Button>
							))
						) : (
							<p className="text-sm text-muted-foreground">No followers yet.</p>
						)}
					</div>
					{viewStates.followers.hasMore && (
						<div className="mt-4 flex justify-center">
							<Button
								variant="ghost"
								onClick={viewStates.followers.onLoadMore}
								disabled={viewStates.followers.loading}
							>
								{viewStates.followers.loading ? "Loading..." : "See more followers"}
							</Button>
						</div>
					)}
				</>
			)}

			{activeView === "following" && (
				<>
					<div className="flex flex-col gap-3">
						{following.length > 0 ? (
							following.map((followedUser) => (
								<Button
									key={followedUser.id}
									variant="outline"
									className="justify-start gap-2"
									onClick={() => onOpenProfile(followedUser.userName)}
								>
									<Avatar className="h-6 w-6">
										<AvatarImage src={getImageUrl(followedUser.picture)} />
										<AvatarFallback className="text-[10px]">
											{followedUser.firstName[0] + followedUser.lastName[0]}
										</AvatarFallback>
									</Avatar>
									<p className="text-md">
										{followedUser.firstName} {followedUser.lastName}
									</p>
									<p className="text-gray-500 text-sm">@{followedUser.userName}</p>
								</Button>
							))
						) : (
							<p className="text-sm text-muted-foreground">Not following anyone yet.</p>
						)}
					</div>
					{viewStates.following.hasMore && (
						<div className="mt-4 flex justify-center">
							<Button
								variant="ghost"
								onClick={viewStates.following.onLoadMore}
								disabled={viewStates.following.loading}
							>
								{viewStates.following.loading ? "Loading..." : "See more following"}
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
