import { Hash } from "lucide-react";

interface HashtagSearchResultProps {
	hashtag: {
		id: number;
		name: string;
		postCount: number;
	};
	onClick?: () => void;
}

export function HashtagSearchResult({ hashtag, onClick }: HashtagSearchResultProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors"
		>
			<div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
				<Hash className="w-6 h-6 text-white" />
			</div>
			<div className="flex-1 text-left">
				<p className="font-semibold">{hashtag.name}</p>
				<p className="text-sm text-muted-foreground">
					{hashtag.postCount} {hashtag.postCount === 1 ? "post" : "posts"}
				</p>
			</div>
		</button>
	);
}
