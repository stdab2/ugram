import { Post } from "@/components/Post";
import { PostSkeleton } from "@/components/PostSkeleton";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/Empty";
import { Button } from "@/components/ui/Button";
import { usePostsQuery, useDeletePostMutation } from "@/generated/graphql";
import { RefreshCcw, ImageOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageFade } from "@/components/PageFade";
import { toast } from "sonner";

export function FeedPage() {
	const { data, loading, error, refetch } = usePostsQuery({
		variables: { limit: 20, offset: 0 },
	});

	const navigate = useNavigate();

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
			toast.success("Your post has been successfully deleted !");
		} catch (error) {
			console.error("Failed to delete post:", error);
		}
	};

	if (loading) {
		return (
			<PageFade key="loading" delay={0.3}>
				<div className="flex justify-center min-h-screen bg-background">
					<div className="w-full max-w-[630px] pb-20 md:pb-0">
						{Array.from({ length: 3 }).map((_, i) => (
							<PostSkeleton key={i} />
						))}
					</div>
				</div>
			</PageFade>
		);
	}

	// On error or no data, show empty state instead of error message
	if (error || !data?.posts || data.posts.length === 0) {
		return (
			<PageFade key="empty">
				<div className="flex justify-center min-h-screen bg-background items-center">
					<Empty>
						<EmptyHeader>
							<ImageOff className="h-12 w-12 mb-4 text-muted-foreground" />
							<EmptyTitle>No Posts Available</EmptyTitle>
							<EmptyDescription>
								{error
									? "We're having trouble loading posts right now. Please try again."
									: "There are no posts to display at the moment. Check back later!"}
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<Button onClick={() => refetch()} variant="default">
									<RefreshCcw className="mr-2 h-4 w-4" />
									Try Again
								</Button>
								<Button onClick={() => navigate("/create")} variant="outline">
									Create Your First Post
								</Button>
							</div>
						</EmptyContent>
					</Empty>
				</div>
			</PageFade>
		);
	}

	// Sort posts by date (most recent first)
	const sortedPosts = [...data.posts].sort(
		(a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
	);

	return (
		<PageFade key="content">
			<div className="flex justify-center min-h-screen bg-background">
				<div className="w-full max-w-[630px] pb-20 md:pb-0">
					{sortedPosts.map((post) => (
						<Post
							key={post.id}
							post={post}
							aspectRatio={"square"}
							likes={post.likeCount}
							comments={post.messageCount}
							isLiked={post.isLikedByCurrentUser}
							onComment={() => console.log("Comment", post.id)}
							onPostDeletion={handlePostDeletion}
						/>
					))}
				</div>
			</div>
		</PageFade>
	);
}
