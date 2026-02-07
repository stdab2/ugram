import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Heart, MessageCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { PostModal } from "@/components/PostModal";
import { PostMenu } from "@/components/PostMenu";
import { DeletePostDialog } from "@/components/DeletePostDialog";
import { mockUserProfile } from "@/lib/mockData";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

interface PostProps {
	id: string;
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
	onClick?: () => void;
}

export function Post({
	id,
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
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const navigate = useNavigate();

	const isOwnPost = author.username === mockUserProfile.username;
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
				const username = part.slice(1);
				return (
					<Link
						key={index}
						to={`/profile/${username}`}
						className="text-indigo-400 font-medium hover:underline"
					>
						{part}
					</Link>
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
		<>
			<Card className="w-full max-w-[630px] border-0 border-b rounded-none">
				{/* Header */}
				<div className="flex items-center justify-between gap-3 p-3">
					<div className="flex items-center gap-3">
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
					<PostMenu
						isOwnPost={isOwnPost}
						onEdit={() => navigate(`/post/${id}/edit`)}
						onDelete={() => setShowDeleteDialog(true)}
						onReport={() => console.log("Report post", id)}
					/>
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
						onClick={() => {
							setIsModalOpen(true);
							onComment?.();
						}}
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
									<Link
										key={index}
										to={`/search?q=${encodeURIComponent(tag)}`}
										className="hover:underline mr-1"
									>
										{tag}
									</Link>
								))}
							</p>
						)}
					</div>
				)}
			</Card>

			<PostModal
				key={id}
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				post={{
					id,
					author,
					imageUrl,
					aspectRatio,
					publishedAt,
					description,
					likes,
					comments,
					isLiked,
				}}
			/>

			<DeletePostDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				isDeleting={isDeleting}
				onConfirm={async () => {
					setIsDeleting(true);
					// Simulate API call
					await new Promise((resolve) => setTimeout(resolve, 1000));
					console.log("Deleting post", id);
					setIsDeleting(false);
					setShowDeleteDialog(false);
					// Navigate back to feed
					navigate("/");
				}}
			/>
		</>
	);
}

export function PostPreview({ imageUrl, className, onClick }: PostPreviewProps) {
	return (
		<button
			onClick={onClick}
			className={cn("aspect-square overflow-hidden bg-muted w-full", className)}
			aria-label="View post"
		>
			<img
				src={imageUrl}
				alt="Post preview"
				className="w-full h-full object-cover hover:opacity-90 transition-opacity"
			/>
		</button>
	);
}
