import { PostPreview } from "@/components/PostPreview";

export interface PostGridPost {
	id: string | number;
	thumbnailUrl: string | null;
	imageStatus?: string;
	likeCount: number;
	messageCount: number;
}

interface PostGridProps {
	posts: PostGridPost[];
	onPostClick: (post: PostGridPost) => void;
}

export function PostGrid({ posts, onPostClick }: PostGridProps) {
	return (
		<div className={"grid grid-cols-2 md:grid-cols-3 gap-1"}>
			{posts.map((post) => (
				<PostPreview
					key={post.id}
					thumbnailUrl={post.thumbnailUrl}
					imageStatus={post.imageStatus}
					likes={post.likeCount}
					comments={post.messageCount}
					onClick={() => onPostClick(post)}
				/>
			))}
		</div>
	);
}
