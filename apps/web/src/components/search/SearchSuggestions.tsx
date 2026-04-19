import { useRef, useEffect } from "react";
import { User, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AutocompleteUserItem {
	id: number;
	userName: string;
	firstName: string;
	lastName: string;
	picture?: string | null;
}

export interface AutocompletePostItem {
	id: number;
	description: string;
	imageUrl: string;
}

interface SearchSuggestionsProps {
	users: AutocompleteUserItem[];
	posts: AutocompletePostItem[];
	activeIndex: number;
	onSelect: (text: string) => void;
	onMouseDown?: (e: React.MouseEvent) => void;
}

function truncate(text: string, maxLength = 60): string {
	return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

export function SearchSuggestions({
	users,
	posts,
	activeIndex,
	onSelect,
	onMouseDown,
}: SearchSuggestionsProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	// Scroll active item into view
	useEffect(() => {
		if (!containerRef.current) return;
		const active = containerRef.current.querySelector<HTMLElement>("[data-active='true']");
		active?.scrollIntoView({ block: "nearest" });
	}, [activeIndex]);

	const totalUsers = users.length;
	const hasAnything = totalUsers > 0 || posts.length > 0;

	if (!hasAnything) return null;

	function getIndexFor(section: "users" | "posts", i: number): number {
		return section === "users" ? i : totalUsers + i;
	}

	return (
		<div
			ref={containerRef}
			role="listbox"
			aria-label="Search suggestions"
			onMouseDown={onMouseDown}
			className="absolute top-full left-0 right-0 z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border border-border bg-popover shadow-lg"
		>
			{users.length > 0 && (
				<div>
					<p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						Users
					</p>
					{users.map((user, i) => {
						const idx = getIndexFor("users", i);
						const isActive = activeIndex === idx;
						return (
							<button
								key={user.id}
								role="option"
								aria-selected={isActive}
								data-active={isActive}
								type="button"
								onClick={() => onSelect(user.userName)}
								className={cn(
									"flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors",
									isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
								)}
							>
								{user.picture ? (
									<img
										src={user.picture}
										alt={user.userName}
										className="h-7 w-7 rounded-full object-cover shrink-0"
									/>
								) : (
									<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
										<User className="h-4 w-4 text-muted-foreground" />
									</span>
								)}
								<span>
									<span className="font-medium">{user.userName}</span>
									<span className="ml-1 text-muted-foreground">
										{user.firstName} {user.lastName}
									</span>
								</span>
							</button>
						);
					})}
				</div>
			)}

			{posts.length > 0 && (
				<div>
					{users.length > 0 && <div className="border-t border-border" />}
					<p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						Posts
					</p>
					{posts.map((post, i) => {
						const idx = getIndexFor("posts", i);
						const isActive = activeIndex === idx;
						return (
							<button
								key={post.id}
								role="option"
								aria-selected={isActive}
								data-active={isActive}
								type="button"
								onClick={() => onSelect(truncate(post.description, 80))}
								className={cn(
									"flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors",
									isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
								)}
							>
								<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-muted overflow-hidden">
									<img
										src={post.imageUrl}
										alt=""
										className="h-full w-full object-cover"
										onError={(e) => {
											(e.target as HTMLImageElement).style.display = "none";
										}}
									/>
								</span>
								<span>
									<FileText className="mr-1 inline h-3 w-3 text-muted-foreground" />
									{truncate(post.description)}
								</span>
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
