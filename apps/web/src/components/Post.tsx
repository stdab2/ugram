import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Heart, MessageCircle, Send } from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";
import { formatDescription, formatDate } from "@/lib/postUtils";
import { PostModal } from "@/components/PostModal";
import { PostMenu } from "@/components/PostMenu";
import { DeletePostDialog } from "@/components/DeletePostDialog";
import { CURRENT_USERNAME } from "@/lib/constants";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { PostsQuery } from "@/generated/graphql";

type PostData = PostsQuery["posts"][0];

interface PostProps {
	post: PostData;
	aspectRatio?: "square" | "portrait" | "landscape"; // 1:1, 4:5, 1.91:1
	likes?: number;
	comments?: number;
	isLiked?: boolean;
	onLike?: () => void;
	onComment?: () => void;
	onShare?: () => void;
}

export function Post({
	post,
	aspectRatio = "square",
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

	const avatarFallback = post.author.firstName[0] + post.author.lastName[0];
	const isOwnPost = post.author.userName === CURRENT_USERNAME;
	const aspectRatioClasses = {
		square: "aspect-square",
		portrait: "aspect-[4/5]",
		landscape: "aspect-[1.91/1]",
	};

	const { description: formattedDescription, hashtags } = formatDescription(post.description);

	return (
		<>
			<Card className="w-full max-w-[630px] border-0 border-b rounded-none">
				{/* Header */}
				<div className="flex items-center justify-between gap-3 p-3">
					<div className="flex items-center gap-3">
						<Avatar className="h-8 w-8">
							<AvatarImage src={getImageUrl(post.author.picture)} />
							<AvatarFallback>{avatarFallback}</AvatarFallback>
						</Avatar>
						<div className="flex items-center gap-2">
							<span className="text-sm font-semibold">{post.author.userName}</span>
							<span className="text-muted-foreground text-sm">•</span>
							<span className="text-muted-foreground text-sm">{formatDate(post.createdAt)}</span>
						</div>
					</div>
					<PostMenu
						isOwnPost={isOwnPost}
						onEdit={() => navigate(`/post/${post.id}/edit`)}
						onDelete={() => setShowDeleteDialog(true)}
						onReport={() => console.log("Report post", post.id)}
					/>
				</div>

				{/* Image */}
				<div className={cn("w-full overflow-hidden bg-muted", aspectRatioClasses[aspectRatio])}>
					<img
						src={getImageUrl(post.imageUrl)}
						alt={`Post by ${post.author.userName}`}
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
				{post.description && (
					<div className="px-3 pb-3">
						<p className="text-sm">
							<span className="font-semibold mr-2">{post.author.userName}</span>
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
				key={post.id}
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				post={post}
				aspectRatio={aspectRatio}
				likes={likes}
				comments={comments}
				isLiked={isLiked}
			/>

			<DeletePostDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				isDeleting={isDeleting}
				onConfirm={async () => {
					setIsDeleting(true);
					// Simulate API call
					await new Promise((resolve) => setTimeout(resolve, 1000));
					console.log("Deleting post", post.id);
					setIsDeleting(false);
					setShowDeleteDialog(false);
					// Navigate back to feed
					navigate("/");
				}}
			/>
		</>
	);
}
