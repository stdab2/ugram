import type { PostsQuery } from "@/generated/graphql";
import { PostPreviewWithStats } from "@/components/Post";

interface PostGridProps {
	posts: PostsQuery["posts"];
	onPostClick: (postId: string) => void;
}

export function PostGrid({ posts, onPostClick }: PostGridProps) {
	return (
		<div className="grid grid-cols-3 gap-1">
			{posts.map((post) => (
				<PostPreviewWithStats
					key={post.id}
					imageUrl={post.imageUrl}
					likes={0}
					comments={0}
					onClick={() => onPostClick(post.id.toString())}
				/>
			))}
		</div>
	);
}
