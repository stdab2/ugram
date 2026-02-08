import { Post } from "@/components/Post";
import { mockPosts } from "@/lib/mockData";

export function FeedPage() {
	return (
		<div className="flex justify-center min-h-screen bg-background">
			<div className="w-full max-w-[630px] pb-20 md:pb-0">
				{mockPosts.map((post) => (
					<Post
						key={post.id}
						id={post.id}
						author={post.author}
						imageUrl={post.imageUrl}
						aspectRatio={post.aspectRatio}
						publishedAt={post.publishedAt}
						description={post.description}
						likes={post.likes}
						comments={post.comments}
						isLiked={post.isLiked}
						onLike={() => console.log("Like", post.id)}
						onComment={() => console.log("Comment", post.id)}
						onShare={() => console.log("Share", post.id)}
					/>
				))}
			</div>
		</div>
	);
}
