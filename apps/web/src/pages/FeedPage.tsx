import { Post } from "@/components/Post";

import { usePostsQuery } from "@/generated/graphql";

export function FeedPage() {
	const { data, loading, error } = usePostsQuery({
		variables: { limit: 20, offset: 0 },
	});

	if (loading) return <p>Loading...</p>;
	if (error) return <p>{error.message}</p>;

	return (
		<div className="flex justify-center min-h-screen bg-background">
			<div className="w-full max-w-[630px] pb-20 md:pb-0">
				{data?.posts.map((post) => (
					<Post
						key={post.id}
						id={post.id.toString()}
						author={{
							username: post.author.userName,
							avatarUrl: post.author.picture?.toString() || undefined,
							avatarFallback: post.author.firstName[0] + post.author.lastName[0],
						}}
						imageUrl={post.imageUrl}
						aspectRatio={"square"}
						publishedAt={post.createdAt?.toString() || ""}
						description={post.description}
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
