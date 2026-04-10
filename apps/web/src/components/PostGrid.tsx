import { PostPreview } from "@/components/PostPreview";

interface PostGridProps {
	posts: Array<{
		id: string | number;
		imageUrl: string;
		likeCount?: number;
		messageCount?: number;
	}>;
	onPostClick: (post: PostGridProps["posts"][0]) => void;
}

export function PostGrid({ posts, onPostClick }: PostGridProps) {
	return (
		<div className="grid grid-cols-3 gap-1">
			{posts.map((post) => (
				<PostPreview
					key={post.id}
					imageUrl={post.imageUrl}
					likes={post.likeCount || 0}
					comments={post.messageCount || 0}
					onClick={() => onPostClick(post)}
				/>
			))}
		</div>
	);
}
