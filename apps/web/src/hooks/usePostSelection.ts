import { useState, useMemo } from "react";
import type { PostType } from "@/types";

export function usePostSelection(allPosts: PostType[]) {
	const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

	const selectedPost = useMemo(
		() =>
			selectedPostId !== null
				? (allPosts.find((post) => post.id === selectedPostId) ?? null)
				: null,
		[selectedPostId, allPosts]
	);

	const openPost = (post: PostType) => {
		setSelectedPostId(Number(post.id));
	};

	const closePost = () => {
		setSelectedPostId(null);
	};

	return {
		selectedPostId,
		selectedPost,
		openPost,
		closePost,
		setSelectedPostId,
	};
}
