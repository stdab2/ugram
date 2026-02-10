import { Input } from "@/components/ui/Input";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	onClear: () => void;
	placeholder?: string;
	className?: string;
}

export function SearchBar({
	value,
	onChange,
	onClear,
	placeholder = "Search",
	className,
}: SearchBarProps) {
	return (
		<div className={cn("relative", className)}>
			<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
			<Input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="pl-12 pr-12 h-12 text-base bg-zinc-100 dark:bg-zinc-900 border-0 rounded-xl"
			/>
			{value && (
				<button
					onClick={onClear}
					className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
				>
					<X className="w-5 h-5" />
				</button>
			)}
		</div>
	);
}
