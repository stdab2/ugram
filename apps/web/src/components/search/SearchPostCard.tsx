import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Heart, MessageCircle } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

interface SearchPostCardProps {
	post: {
		id: number;
		description: string;
		imageUrl: string;
		likeCount: number;
		author: {
			firstName: string;
			lastName: string;
			picture?: string | null;
			userName: string;
		};
	};
	onClick: () => void;
}

const DESCRIPTION_PREVIEW_LENGTH = 140;

function truncateDescription(description: string) {
	if (description.length <= DESCRIPTION_PREVIEW_LENGTH) {
		return description;
	}

	return `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH).trimEnd()}...`;
}

export function SearchPostCard({ post, onClick }: SearchPostCardProps) {
	return (
		<Card className="overflow-hidden border border-border/60 bg-card/70 backdrop-blur-sm">
			<button
				type="button"
				onClick={onClick}
				className="flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-muted/40"
			>
				<img
					src={getImageUrl(post.imageUrl)}
					alt={`Post by ${post.author.userName}`}
					className="h-20 w-20 shrink-0 rounded-md object-cover"
				/>
				<div className="min-w-0 flex-1 space-y-2">
					<div className="flex items-center gap-2">
						<Avatar className="h-6 w-6">
							<AvatarImage src={getImageUrl(post.author.picture)} />
							<AvatarFallback>
								{post.author.firstName[0]}
								{post.author.lastName[0]}
							</AvatarFallback>
						</Avatar>
						<span className="text-sm font-semibold">{post.author.userName}</span>
					</div>
					<p className="text-sm text-foreground/90">{truncateDescription(post.description)}</p>
					<div className="flex items-center gap-4 text-xs text-muted-foreground">
						<span className="inline-flex items-center gap-1">
							<Heart className="h-3.5 w-3.5" />
							{post.likeCount}
						</span>
						<span className="inline-flex items-center gap-1">
							<MessageCircle className="h-3.5 w-3.5" />0
						</span>
					</div>
				</div>
			</button>
		</Card>
	);
}
