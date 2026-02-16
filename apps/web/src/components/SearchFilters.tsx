import { Button } from "@/components/ui/Button";
import type { SearchType } from "@/types/search";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
	activeFilter: SearchType;
	onFilterChange: (filter: SearchType) => void;
}

export function SearchFilters({ activeFilter, onFilterChange }: SearchFiltersProps) {
	const filters: { value: SearchType; label: string }[] = [
		{ value: "all", label: "All" },
		{ value: "users", label: "Users" },
		{ value: "posts", label: "Posts" },
		{ value: "hashtags", label: "Hashtags" },
	];

	return (
		<div className="flex gap-2 px-4 pb-2 overflow-x-auto">
			{filters.map((filter) => (
				<Button
					key={filter.value}
					variant="ghost"
					size="sm"
					onClick={() => onFilterChange(filter.value)}
					className={cn(
						"rounded-lg whitespace-nowrap border-b-2 border-transparent",
						activeFilter === filter.value && "bg-muted"
					)}
				>
					{filter.label}
				</Button>
			))}
		</div>
	);
}
