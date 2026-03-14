import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Heart, MessageCircle, Send } from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";
import { formatDescription, formatDate } from "@/lib/postUtils";
import { PostModal } from "@/components/PostModal";
import { PostMenu } from "@/components/PostMenu";
import { DeletePostDialog } from "@/components/DeletePostDialog";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { PostsQuery } from "@/generated/graphql";
import { useAuth } from "@/AuthContext";

type PostData = PostsQuery["posts"][0];

interface PostProps {
	post: PostData;
	aspectRatio?: "square" | "portrait" | "landscape"; // 1:1, 4:5, 1.91:1
	likes?: number;
	comments?: number;
	isLiked?: boolean;
	onLike?: () => void;
	onComment?: () => void;
	onPostDeletion: (postId: number) => void;
}

export function Post({
	post,
	aspectRatio = "square",
	likes = 0,
	comments = 0,
	isLiked = false,
	onLike,
	onComment,
	onPostDeletion,
}: PostProps) {
	const { userAuth } = useAuth();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const navigate = useNavigate();

	const avatarFallback = post.author.firstName[0] + post.author.lastName[0];
	const isOwnPost = post.author.userName === userAuth!.userName;
	const aspectRatioClasses = {
		square: "aspect-square",
		portrait: "aspect-[4/5]",
		landscape: "aspect-[1.91/1]",
	};

	const { description: formattedDescription, hashtags } = formatDescription(post.description);

	function handlePostDeletion(postId: number) {
		setIsDeleting(true);
		onPostDeletion(postId);
		setIsDeleting(false);
		setShowDeleteDialog(false);
	}

	return (
		<>
			<Card className="w-full max-w-[630px] border-0 border-b rounded-none">
				{/* Header */}
				<div className="flex items-center justify-between gap-3 p-3">
					<div className="flex items-center gap-3">
						<Link to={`/profile/${post.author.userName}`}>
							<Avatar className="h-8 w-8">
								<AvatarImage src={getImageUrl(post.author.picture)} />
								<AvatarFallback>{avatarFallback}</AvatarFallback>
							</Avatar>
						</Link>
						<div className="flex items-center gap-2">
							<Link
								to={`/profile/${post.author.userName}`}
								className="text-sm font-semibold hover:underline"
							>
								{post.author.userName}
							</Link>
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
				<button
					onClick={() => setIsModalOpen(true)}
					className={cn(
						"w-full overflow-hidden bg-muted cursor-pointer",
						aspectRatioClasses[aspectRatio]
					)}
					aria-label="View post details"
				>
					<img
						src={getImageUrl(post.imageUrl)}
						alt={`Post by ${post.author.userName}`}
						className="w-full h-full object-cover"
					/>
				</button>

				{/* Actions */}
				<div className="flex items-center gap-4 p-3">
					<button
						onClick={onLike}
						className="flex items-center gap-2 hover:text-muted-foreground transition-all duration-200 hover:scale-110"
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
						className="flex items-center gap-2 hover:text-muted-foreground transition-all duration-200 hover:scale-110"
						aria-label="Comment"
					>
						<MessageCircle className="w-6 h-6" strokeWidth={2} />
						{comments > 0 && (
							<span className="text-sm font-semibold">{comments.toLocaleString()}</span>
						)}
					</button>
					<Link
						to={`/post/${post.id}`}
						className="hover:text-muted-foreground transition-all duration-200 hover:scale-110"
						aria-label="Share"
					>
						<Send className="w-6 h-6" strokeWidth={2} />
					</Link>
				</div>

				{/* Description */}
				{post.description && (
					<div className="px-3 pb-3">
						<p className="text-sm">
							<Link
								to={`/profile/${post.author.userName}`}
								className="font-semibold mr-2 hover:underline"
							>
								{post.author.userName}
							</Link>
							{formattedDescription}
						</p>
						{hashtags.length > 0 && (
							<p className="text-sm text-indigo-400 mt-1">
								{hashtags.map((tag, index) => (
									<Link
										key={index}
										to={`/search?q=${encodeURIComponent(tag)}`}
										className="hover:underline mr-1 transition-all duration-200 hover:brightness-125"
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
				onPostDeletion={() => handlePostDeletion(post.id)}
			/>

			<DeletePostDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				isDeleting={isDeleting}
				onConfirm={() => handlePostDeletion(post.id)}
			/>
		</>
	);
}
