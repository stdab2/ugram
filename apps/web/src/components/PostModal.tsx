import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Send } from "lucide-react";
import { PostMenu } from "@/components/PostMenu";
import { DeletePostDialog } from "@/components/DeletePostDialog";
import { cn } from "@/lib/utils";
import { mockUserProfile } from "@/lib/mockData";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Comment {
	id: string;
	author: {
		username: string;
		avatarUrl?: string;
		avatarFallback: string;
	};
	text: string;
	publishedAt: string;
}

interface PostModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	post: {
		id: string;
		author: {
			username: string;
			avatarUrl?: string;
			avatarFallback: string;
		};
		imageUrl: string;
		aspectRatio?: "square" | "portrait" | "landscape";
		publishedAt: string;
		description?: string;
		likes?: number;
		comments?: number;
		isLiked?: boolean;
	};
}

export function PostModal({ open, onOpenChange, post }: PostModalProps) {
	const [newComment, setNewComment] = useState("");
	const [isLiked, setIsLiked] = useState(post.isLiked || false);
	const [likesCount, setLikesCount] = useState(post.likes || 0);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const navigate = useNavigate();

	const isOwnPost = post.author.username === mockUserProfile.username;

	// Mock comments - use lazy initialization to avoid calling Date.now() during render
	const [comments, setComments] = useState<Comment[]>(() => [
		{
			id: "1",
			author: {
				username: "jane_smith",
				avatarUrl: "https://i.pravatar.cc/150?img=5",
				avatarFallback: "JS",
			},
			text: "Amazing shot! 😍",
			publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: "2",
			author: {
				username: "travel_explorer",
				avatarUrl: "https://i.pravatar.cc/150?img=8",
				avatarFallback: "TE",
			},
			text: "Love this! Where was this taken?",
			publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
		},
	]);

	const formatDescription = (text?: string) => {
		if (!text) return { description: null, hashtags: [] };

		const hashtagMatches = text.match(/#\w+/g) || [];
		const descriptionWithoutHashtags = text.replace(/#\w+/g, "").trim();

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

	const handleLike = () => {
		setIsLiked(!isLiked);
		setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
	};

	const handleAddComment = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newComment.trim()) return;

		const comment: Comment = {
			id: Date.now().toString(),
			author: {
				username: "current_user",
				avatarUrl: "https://i.pravatar.cc/150?img=10",
				avatarFallback: "CU",
			},
			text: newComment,
			publishedAt: new Date().toISOString(),
		};

		setComments((prevComments) => [comment, ...prevComments]);
		setNewComment("");
	};

	const { description: formattedDescription, hashtags } = formatDescription(post.description);

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent
					showCloseButton={false}
					className="max-w-[95vw] w-full h-[90vh] p-0 gap-0 overflow-hidden rounded-xl md:max-w-7xl flex flex-col"
				>
					<div className="grid grid-cols-1 md:grid-cols-2 flex-1 min-h-0 w-full">
						{/* Left side - Image */}
						<div className="bg-black flex items-center justify-center">
							<img
								src={post.imageUrl}
								alt={`Post by ${post.author.username}`}
								className="w-full h-full object-contain"
							/>
						</div>

						{/* Right side - Details */}
						<div className="flex flex-col h-full bg-background overflow-hidden">
							{/* Header */}
							<div className="flex items-center justify-between gap-3 p-4 border-b flex-shrink-0">
								<div className="flex items-center gap-3">
									<Avatar className="h-10 w-10">
										<AvatarImage src={post.author.avatarUrl} />
										<AvatarFallback>{post.author.avatarFallback}</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-semibold text-sm">{post.author.username}</p>
										<p className="text-xs text-muted-foreground">{formatDate(post.publishedAt)}</p>
									</div>
								</div>
								<PostMenu
									isOwnPost={isOwnPost}
									onEdit={() => {
										onOpenChange(false);
										navigate(`/post/${post.id}/edit`);
									}}
									onDelete={() => setShowDeleteDialog(true)}
									onReport={() => console.log("Report post", post.id)}
								/>
							</div>

							{/* Caption */}
							<div className="p-4 border-b flex-shrink-0">
								<div className="flex gap-3">
									<Avatar className="h-8 w-8 flex-shrink-0">
										<AvatarImage src={post.author.avatarUrl} />
										<AvatarFallback>{post.author.avatarFallback}</AvatarFallback>
									</Avatar>
									<div className="flex-1">
										<p className="text-sm">
											<span className="font-semibold mr-2">{post.author.username}</span>
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
								</div>
							</div>

							{/* Comments */}
							<div className="flex-1 min-h-0 overflow-hidden">
								<div className="h-full overflow-y-auto p-4 space-y-4">
									{comments.map((comment) => (
										<div key={comment.id} className="flex gap-3">
											<Avatar className="h-8 w-8 flex-shrink-0">
												<AvatarImage src={comment.author.avatarUrl} />
												<AvatarFallback>{comment.author.avatarFallback}</AvatarFallback>
											</Avatar>
											<div className="flex-1">
												<p className="text-sm">
													<span className="font-semibold mr-2">{comment.author.username}</span>
													{comment.text}
												</p>
												<p className="text-xs text-muted-foreground mt-1">
													{formatDate(comment.publishedAt)}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Actions */}
							<div className="border-t flex-shrink-0">
								<div className="flex items-center gap-4 p-4">
									<button
										onClick={handleLike}
										className="flex items-center gap-2 hover:text-muted-foreground transition-colors"
										aria-label="Like"
									>
										<Heart
											className={cn("w-7 h-7", isLiked && "fill-red-500 text-red-500")}
											strokeWidth={2}
										/>
										{likesCount > 0 && (
											<span className="text-sm font-semibold">{likesCount.toLocaleString()}</span>
										)}
									</button>
									<button
										className="flex items-center gap-2 hover:text-muted-foreground transition-colors"
										aria-label="Comment"
									>
										<MessageCircle className="w-6 h-6" strokeWidth={2} />
										{comments.length > 0 && (
											<span className="text-sm font-semibold">{comments.length}</span>
										)}
									</button>
									<button
										className="hover:text-muted-foreground transition-colors"
										aria-label="Share"
									>
										<Send className="w-6 h-6" strokeWidth={2} />
									</button>
								</div>

								{/* Add comment */}
								<form onSubmit={handleAddComment} className="p-4 pt-0">
									<div className="flex gap-2">
										<Input
											placeholder="Add a comment..."
											value={newComment}
											onChange={(e) => setNewComment(e.target.value)}
											className="flex-1"
										/>
										<Button
											size="lg"
											className="-mt-0.5 p-5"
											type="submit"
											disabled={!newComment.trim()}
										>
											Send
										</Button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>

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
					onOpenChange(false);
					// Refresh or navigate
					window.location.reload();
				}}
			/>
		</>
	);
}
