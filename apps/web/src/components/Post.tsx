import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostProps {
	author: {
		username: string;
		avatarUrl?: string;
		avatarFallback: string;
	};
	imageUrl: string;
	aspectRatio?: "square" | "portrait" | "landscape"; // 1:1, 4:5, 1.91:1
	publishedAt: string;
	description?: string;
	likes?: number;
	comments?: number;
	isLiked?: boolean;
	onLike?: () => void;
	onComment?: () => void;
	onShare?: () => void;
}

interface PostPreviewProps {
	imageUrl: string;
	className?: string;
}

export function Post({
	author,
	imageUrl,
	aspectRatio = "square",
	publishedAt,
	description,
	likes = 0,
	comments = 0,
	isLiked = false,
	onLike,
	onComment,
	onShare,
}: PostProps) {
	const aspectRatioClasses = {
		square: "aspect-square",
		portrait: "aspect-[4/5]",
		landscape: "aspect-[1.91/1]",
	};

	const formatDescription = (text?: string) => {
		if (!text) return { description: null, hashtags: [] };

		// Extract hashtags
		const hashtagMatches = text.match(/#\w+/g) || [];

		// Remove hashtags from description
		const descriptionWithoutHashtags = text.replace(/#\w+/g, "").trim();

		// Format description with mentions
		const parts = descriptionWithoutHashtags.split(/(@\w+)/g);
		const formattedDescription = parts.map((part, index) => {
			if (part.startsWith("@")) {
				return (
					<span key={index} className="text-indigo-400 font-medium cursor-pointer hover:underline">
						{part}
					</span>
				);
			}
			return <span key={index}>{part}</span>;
		});

		return { description: formattedDescription, hashtags: hashtagMatches };
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (diffInSeconds < 60) return `${diffInSeconds}s`;
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
		if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
		if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
		return date.toLocaleDateString();
	};

	const { description: formattedDescription, hashtags } = formatDescription(description);

	return (
		<Card className="w-full max-w-[630px] border-0 border-b rounded-none">
			{/* Header */}
			<div className="flex items-center gap-3 p-3">
				<Avatar className="h-8 w-8">
					<AvatarImage src={author.avatarUrl} />
					<AvatarFallback>{author.avatarFallback}</AvatarFallback>
				</Avatar>
				<div className="flex items-center gap-2">
					<span className="text-sm font-semibold">{author.username}</span>
					<span className="text-muted-foreground text-sm">•</span>
					<span className="text-muted-foreground text-sm">{formatDate(publishedAt)}</span>
				</div>
			</div>

			{/* Image */}
			<div className={cn("w-full overflow-hidden bg-muted", aspectRatioClasses[aspectRatio])}>
				<img
					src={imageUrl}
					alt={`Post by ${author.username}`}
					className="w-full h-full object-cover"
				/>
			</div>

			{/* Actions */}
			<div className="flex items-center gap-4 p-3">
				<button
					onClick={onLike}
					className="flex items-center gap-2 hover:text-muted-foreground transition-colors"
					aria-label="Like"
				>
					<Heart
						className={cn("w-7 h-7", isLiked && "fill-red-500 text-red-500")}
						strokeWidth={2}
					/>
					{likes > 0 && <span className="text-sm font-semibold">{likes.toLocaleString()}</span>}
				</button>
				<button
					onClick={onComment}
					className="flex items-center gap-2 hover:text-muted-foreground transition-colors"
					aria-label="Comment"
				>
					<MessageCircle className="w-6 h-6" strokeWidth={2} />
					{comments > 0 && (
						<span className="text-sm font-semibold">{comments.toLocaleString()}</span>
					)}
				</button>
				<button
					onClick={onShare}
					className="hover:text-muted-foreground transition-colors"
					aria-label="Share"
				>
					<Send className="w-6 h-6" strokeWidth={2} />
				</button>
			</div>

			{/* Description */}
			{description && (
				<div className="px-3 pb-3">
					<p className="text-sm">
						<span className="font-semibold mr-2">{author.username}</span>
						{formattedDescription}
					</p>
					{hashtags.length > 0 && (
						<p className="text-sm text-indigo-400 mt-1">
							{hashtags.map((tag, index) => (
								<span key={index} className="cursor-pointer hover:underline mr-1">
									{tag}
								</span>
							))}
						</p>
					)}
				</div>
			)}
		</Card>
	);
}

export function PostPreview({ imageUrl, className }: PostPreviewProps) {
	return (
		<div className={cn("aspect-square overflow-hidden bg-muted", className)}>
			<img
				src={imageUrl}
				alt="Post preview"
				className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
			/>
		</div>
	);
}
