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
import { usePostsQuery } from "@/generated/graphql";
import { RefreshCcw, ImageOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function FeedPage() {
	const { data, loading, error, refetch } = usePostsQuery({
		variables: { limit: 20, offset: 0 },
	});

	const navigate = useNavigate();

	if (loading) {
		return (
			<div className="flex justify-center min-h-screen bg-background">
				<div className="w-full max-w-[630px] pb-20 md:pb-0">
					{Array.from({ length: 3 }).map((_, i) => (
						<PostSkeleton key={i} />
					))}
				</div>
			</div>
		);
	}

	// On error or no data, show empty state instead of error message
	if (error || !data?.posts || data.posts.length === 0) {
		return (
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
		);
	}

	return (
		<div className="flex justify-center min-h-screen bg-background">
			<div className="w-full max-w-[630px] pb-20 md:pb-0">
				{data.posts.map((post) => (
					<Post
						key={post.id}
						post={post}
						aspectRatio={"square"}
						likes={100} // Replace with actual like count from API
						comments={20} // Replace with actual comment count from API
						isLiked={false} // Replace with actual like status from API
						onLike={() => console.log("Like", post.id)}
						onComment={() => console.log("Comment", post.id)}
						onShare={() => console.log("Share", post.id)}
					/>
				))}
			</div>
		</div>
	);
}
