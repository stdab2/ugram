import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import type { SearchType } from "@/types/search";

const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

export function useSearchState() {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeFilter, setActiveFilter] = useState<SearchType>("all");
	const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

	const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);
	const isSearching = debouncedSearchQuery.trim().length >= MIN_SEARCH_LENGTH;
	const isTyping =
		searchQuery.trim().length >= MIN_SEARCH_LENGTH && searchQuery !== debouncedSearchQuery;

	const handlePostClick = (post: {
		id: string | number;
		imageUrl: string;
		likes?: number;
		comments?: number;
		isLikedByCurrentUser?: boolean;
	}) => {
		setSelectedPostId(Number(post.id));
	};

	const handleUserPostClick = (postId: string | number) => {
		setSelectedPostId(Number(postId));
	};

	const handleHashtagClick = (hashtagName: string) => {
		setSearchQuery(hashtagName);
		setActiveFilter("posts");
	};

	return {
		searchQuery,
		setSearchQuery,
		activeFilter,
		setActiveFilter,
		selectedPostId,
		setSelectedPostId,
		debouncedSearchQuery,
		isSearching,
		isTyping,
		handlePostClick,
		handleUserPostClick,
		handleHashtagClick,
	};
}

export type SearchStateReturn = ReturnType<typeof useSearchState>;

export const PAGINATION = {
	INITIAL_HASHTAGS_LIMIT: 3,
	INITIAL_USERS_LIMIT: 5,
	INITIAL_POSTS_LIMIT: 6,
	LOAD_MORE_HASHTAGS_INCREMENT: 3,
	LOAD_MORE_USERS_INCREMENT: 5,
	LOAD_MORE_POSTS_INCREMENT: 6,
} as const;
