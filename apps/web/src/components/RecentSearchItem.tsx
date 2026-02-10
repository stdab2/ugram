import { Clock, Hash, User, X } from "lucide-react";
import type { RecentSearch } from "@/types/search";

interface RecentSearchItemProps {
	search: RecentSearch;
	onClick: () => void;
	onDelete: () => void;
}

export function RecentSearchItem({ search, onClick, onDelete }: RecentSearchItemProps) {
	const icons = {
		user: User,
		hashtag: Hash,
		general: Clock,
	};

	const Icon = icons[search.type];

	return (
		<div
			className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer group"
			onClick={onClick}
		>
			<div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
				<Icon className="w-5 h-5 text-muted-foreground" />
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium truncate">{search.query}</p>
			</div>
			<button
				onClick={(e) => {
					e.stopPropagation();
					onDelete();
				}}
				className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
			>
				<X className="w-4 h-4" />
			</button>
		</div>
	);
}
