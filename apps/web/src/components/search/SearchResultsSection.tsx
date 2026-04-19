import { LoadMoreButton } from "./LoadMoreButton";

interface SearchResultsSectionProps {
	title: string;
	/** Items to render inside the section */
	children: React.ReactNode;
	/** When true and showEmpty is also true, renders the emptyMessage instead of children */
	isEmpty: boolean;
	/** Whether to display an empty-state message (search mode only) */
	showEmpty?: boolean;
	/** Message shown when isEmpty is true and showEmpty is true */
	emptyMessage?: string;
	hasMore: boolean;
	loading: boolean;
	onLoadMore: () => void;
}

export function SearchResultsSection({
	title,
	children,
	isEmpty,
	showEmpty = false,
	emptyMessage,
	hasMore,
	loading,
	onLoadMore,
}: SearchResultsSectionProps) {
	return (
		<div className="mb-6">
			<div className="px-4 py-3">
				<h2 className="font-semibold">{title}</h2>
			</div>

			{isEmpty && showEmpty ? (
				<p className="px-4 py-8 text-center text-muted-foreground">{emptyMessage}</p>
			) : (
				<>
					{children}
					{hasMore && (
						<div className="px-4 py-3">
							<LoadMoreButton
								loading={loading}
								onClick={onLoadMore}
								label={`See more ${title.toLowerCase()}`}
							/>
						</div>
					)}
				</>
			)}
		</div>
	);
}
