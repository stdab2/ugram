import { useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import { Button } from "@/components/ui/Button";
import { PostGrid } from "@/components/PostGrid";
import { PostModal } from "@/components/PostModal";
import { ProfileSkeleton } from "@/components/ProfileSkeleton";
import { timestampToDateString } from "@/lib/utils";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/Empty";
import { useUserByUserNameQuery, useDeletePostMutation } from "@/generated/graphql";
import { Calendar, UserX, AlertCircle } from "lucide-react";
import { useState } from "react";
import { getImageUrl } from "@/lib/utils";
import { PageFade } from "@/components/PageFade";
import { toast } from "sonner";
import { useAuth } from "@/AuthContext";

export function ProfilePage() {
	const { username } = useParams();
	const navigate = useNavigate();
	const { userAuth } = useAuth();

	// Use username from URL or default to current user
	// Treat "me" as a special keyword for the current user
	const userNameToFetch = username === "me" || !username ? userAuth!.userName : username;

	// Check if this is the current user's profile
	const isOwnProfile = userNameToFetch === userAuth!.userName;

	// Fetch user data by username
	const {
		data: userData,
		loading: userLoading,
		error: userError,
	} = useUserByUserNameQuery({
		variables: { userName: userNameToFetch },
	});

	// const [selectedPost, setSelectedPost] = useState<UserPostType | null>(null);
	const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

	const [deletePost] = useDeletePostMutation({
		update(cache, { data }) {
			if (!data?.deletePost) return;

			cache.evict({ id: cache.identify({ __typename: "Post", id: data.deletePost.id }) });
			cache.gc();
		},
	});

	const handlePostDeletion = async (postId: number) => {
		try {
			await deletePost({ variables: { id: postId } });
			setSelectedPostId(null);
			toast.success("Your post has been successfully deleted!");
		} catch {
			// Error already handled by errorLink
		}
	};

	// Handle loading state
	if (userLoading) {
		return (
			<PageFade key="loading" delay={0.3}>
				<ProfileSkeleton />
			</PageFade>
		);
	}

	// Handle error state
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

	// Handle user not found
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
	// Sort posts by date (most recent first)
	const userPosts = [...(user.posts || [])].sort(
		(a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
	);

	const selectedPost =
		selectedPostId !== null ? (userPosts.find((p) => p.id === selectedPostId) ?? null) : null;
	return (
		<PageFade key="content">
			<div className="w-full min-h-screen bg-background pb-20 md:pb-0">
				<div className="max-w-5xl mx-auto px-4 py-8">
					{/* Profile Header */}
					<Card className="p-6 md:p-8 mb-8">
						<div className="flex flex-col md:flex-row gap-6 md:gap-8">
							{/* Avatar */}
							<div className="flex justify-center md:justify-start">
								<Avatar className="h-32 w-32 md:h-40 md:w-40">
									<AvatarImage src={user.picture ? getImageUrl(user.picture) : undefined} />
									<AvatarFallback className="text-3xl">
										{user.firstName[0] + user.lastName[0]}
									</AvatarFallback>
								</Avatar>
							</div>

							{/* Profile Info */}
							<div className="flex-1 space-y-4">
								<div className="space-y-2">
									<div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
										<h1 className="text-2xl font-bold">{user.userName}</h1>
										{isOwnProfile && (
											<Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
												Edit Profile
											</Button>
										)}
									</div>
									<p className="text-lg text-foreground">
										{user.firstName} {user.lastName}
									</p>
								</div>

								{/* Stats */}
								<div className="flex gap-6">
									<div className="text-center">
										<p className="font-semibold text-lg">{userPosts.length}</p>
										<p className="text-sm text-muted-foreground">Posts</p>
									</div>
									<div className="text-center">
										<p className="font-semibold text-lg">0</p>
										<p className="text-sm text-muted-foreground">Followers</p>
									</div>
									<div className="text-center">
										<p className="font-semibold text-lg">0</p>
										<p className="text-sm text-muted-foreground">Following</p>
									</div>
								</div>
								<Separator />
								{/* Member Since Info */}
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm">
										<Calendar className="h-4 w-4 text-muted-foreground" />
										<span>Member since {timestampToDateString(+user.createdAt)}</span>
									</div>
								</div>
							</div>
						</div>
					</Card>

					{/* Posts Grid */}
					<div>
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-semibold">Posts</h2>
							<Badge variant="secondary">{userPosts.length} posts</Badge>
						</div>
						<PostGrid
							posts={userPosts.map((post) => ({
								id: post.id,
								imageUrl: post.imageUrl || "",
								likeCount: post.likeCount,
								isLikedByCurrentUser: post.isLikedByCurrentUser,
								messageCount: post.messageCount,
							}))}
							onPostClick={(postPreview) => {
								const fullPost = userPosts.find((p) => p.id === postPreview.id);
								if (fullPost) setSelectedPostId(fullPost.id);
							}}
						/>
					</div>

					{/* Post Modal */}
					{selectedPost && (
						<PostModal
							key={selectedPost.id}
							open={!!selectedPost}
							onOpenChange={(open) => !open && setSelectedPostId(null)}
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
