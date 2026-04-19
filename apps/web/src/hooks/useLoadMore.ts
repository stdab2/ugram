import { useState } from "react";

export interface UseLoadMoreReturn {
	hasMore: boolean;
	/** Call after a fetchMore resolves: marks hasMore=false when returnedCount < increment */
	onFetched: (returnedCount: number, increment: number) => void;
	/** Reset to true (e.g. when query/mode changes) */
	reset: () => void;
}

export function useLoadMore(initialHasMore = true): UseLoadMoreReturn {
	const [hasMore, setHasMore] = useState(initialHasMore);

	const onFetched = (returnedCount: number, increment: number) => {
		setHasMore(returnedCount >= increment);
	};

	const reset = () => setHasMore(true);

	return { hasMore, onFetched, reset };
}
