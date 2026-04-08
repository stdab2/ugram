import { useParams, useNavigate, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Heart, MessageCircle, Send } from "lucide-react";
import { PostMenu } from "@/components/PostMenu";
import { DeletePostDialog } from "@/components/DeletePostDialog";
import { cn, getImageUrl } from "@/lib/utils";
import { formatDescription, formatDate } from "@/lib/postUtils";
import { useState } from "react";
import {
	usePostQuery,
	useDeletePostMutation,
	useUnlikePostMutation,
	useLikePostMutation,
} from "@/generated/graphql";
import { PageFade } from "@/components/PageFade";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/Empty";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";
import { useAuth } from "@/AuthContext";

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

export function PostPage() {
	const { userAuth } = useAuth();
	const { id } = useParams();
	const navigate = useNavigate();

	// Parse and validate the id
	const parsedId = parseInt(id || "0");
	const isValidId = Number.isFinite(parsedId) && parsedId > 0;

	// Fetch post data
	const {
		data: postData,
		loading,
		error,
	} = usePostQuery({
		variables: { id: parsedId },
		skip: !isValidId,
	});

	const post = postData?.post;

	const [deletePost] = useDeletePostMutation({
		update(cache, { data }) {
			if (!data?.deletePost) return;

			cache.evict({ id: cache.identify({ __typename: "Post", id: data.deletePost.id }) });
			cache.gc();
		},
	});

	const [newComment, setNewComment] = useState("");
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [likePost] = useLikePostMutation();
	const [unlikePost] = useUnlikePostMutation();

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

	const handleLike = async () => {
		if (post?.isLikedByCurrentUser) {
			await unlikePost({
				variables: { postId: post.id },
			});
		} else {
			if (post) {
				await likePost({
					variables: { postId: post.id },
				});
			}
		}
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

	const handlePostDeletion = async (postId: number) => {
		setIsDeleting(true);
		try {
			await deletePost({ variables: { id: postId } });
			toast.success("Your post has been successfully deleted!");
			navigate("/");
		} catch {
			// Error already handled by errorLink
			setIsDeleting(false);
		} finally {
			setShowDeleteDialog(false);
		}
	};

	// Handle loading state
	if (loading) {
		return (
			<PageFade key="loading" delay={0.3}>
				<div className="w-full min-h-screen bg-background pb-20 md:pb-0">
					<div className="max-w-7xl mx-auto p-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Skeleton className="w-full aspect-square" />
							<div className="flex flex-col gap-4">
								<Skeleton className="w-full h-16" />
								<Skeleton className="w-full h-32" />
								<Skeleton className="w-full h-64" />
							</div>
						</div>
					</div>
				</div>
			</PageFade>
		);
	}

	// Handle error state
	if (error) {
		return (
			<PageFade key="error">
				<div className="w-full min-h-screen bg-background pb-20 md:pb-0 flex items-center justify-center p-4">
					<Empty>
						<EmptyHeader>
							<AlertCircle className="h-12 w-12 mb-4 text-muted-foreground" />
							<EmptyTitle>Error Loading Post</EmptyTitle>
							<EmptyDescription>{error.message}</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button onClick={() => navigate("/")}>Go back to feed</Button>
						</EmptyContent>
					</Empty>
				</div>
			</PageFade>
		);
	}

	// Handle post not found
	if (!post) {
		return (
			<PageFade key="not-found">
				<div className="w-full min-h-screen bg-background pb-20 md:pb-0 flex items-center justify-center p-4">
					<Empty>
						<EmptyHeader>
							<AlertCircle className="h-12 w-12 mb-4 text-muted-foreground" />
							<EmptyTitle>Post Not Found</EmptyTitle>
							<EmptyDescription>
								The post you&apos;re looking for doesn&apos;t exist.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button onClick={() => navigate("/")}>Go back to feed</Button>
						</EmptyContent>
					</Empty>
				</div>
			</PageFade>
		);
	}

	// Extract author info for convenience
	const author = post.author;
	const isOwnPost = author.userName === userAuth!.userName;

	const { description: formattedDescription, hashtags } = formatDescription(post.description);

	return (
		<>
			<PageFade key="content">
				<div className="w-full min-h-screen bg-background pb-20 md:pb-0">
					<div className="max-w-7xl mx-auto p-4">
						{/* Back button */}
						<Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 gap-2">
							Back
						</Button>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4 border rounded-xl overflow-hidden bg-card">
							{/* Left side - Image */}
							<div className="bg-black flex items-center justify-center">
								<img
									src={getImageUrl(post.imageUrl)}
									alt={`Post by ${author.userName}`}
									className="w-full h-full object-contain"
								/>
							</div>

							{/* Right side - Details */}
							<div className="flex flex-col h-full bg-background overflow-hidden">
								{/* Header */}
								<div className="flex items-center justify-between gap-3 p-4 border-b flex-shrink-0">
									<div className="flex items-center gap-3">
										<Link to={`/profile/${author.userName}`}>
											<Avatar className="h-10 w-10">
												<AvatarImage src={getImageUrl(author.picture)} />
												<AvatarFallback>{author.firstName[0] + author.lastName[0]}</AvatarFallback>
											</Avatar>
										</Link>
										<div>
											<Link to={`/profile/${author.userName}`}>
												<p className="font-semibold text-sm hover:underline">{author.userName}</p>
											</Link>
											<p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
										</div>
									</div>
									<PostMenu
										isOwnPost={isOwnPost}
										onEdit={() => navigate(`/post/${post.id}/edit`)}
										onDelete={() => setShowDeleteDialog(true)}
										onReport={() => console.log("Report post", post.id)}
									/>
								</div>

								{/* Caption */}
								<div className="p-4 border-b flex-shrink-0">
									<div className="flex gap-3">
										<Link to={`/profile/${author.userName}`}>
											<Avatar className="h-8 w-8 flex-shrink-0">
												<AvatarImage src={getImageUrl(author.picture)} />
												<AvatarFallback>{author.firstName[0] + author.lastName[0]}</AvatarFallback>
											</Avatar>
										</Link>
										<div className="flex-1">
											<p className="text-sm">
												<Link
													to={`/profile/${author.userName}`}
													className="font-semibold mr-2 hover:underline"
												>
													{author.userName}
												</Link>
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
									</div>
								</div>

								{/* Comments */}
								<div className="flex-1 min-h-0 overflow-hidden">
									<div className="h-full overflow-y-auto p-4 space-y-4">
										{comments.map((comment) => (
											<div key={comment.id} className="flex gap-3">
												<Link to={`/profile/${comment.author.username}`}>
													<Avatar className="h-8 w-8 flex-shrink-0">
														<AvatarImage src={comment.author.avatarUrl} />
														<AvatarFallback>{comment.author.avatarFallback}</AvatarFallback>
													</Avatar>
												</Link>
												<div className="flex-1">
													<p className="text-sm">
														<Link
															to={`/profile/${comment.author.username}`}
															className="font-semibold mr-2 hover:underline"
														>
															{comment.author.username}
														</Link>
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
												className={cn(
													"w-7 h-7",
													post?.isLikedByCurrentUser && "fill-red-500 text-red-500"
												)}
												strokeWidth={2}
											/>
											{post?.likeCount > 0 && (
												<span className="text-sm font-semibold">
													{post.likeCount.toLocaleString()}
												</span>
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
											onClick={() => {
												navigator.clipboard.writeText(window.location.href);
												toast.success("Link copied to clipboard!");
											}}
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
					</div>
				</div>
			</PageFade>

			<DeletePostDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				isDeleting={isDeleting}
				onConfirm={() => handlePostDeletion(post.id)}
			/>
		</>
	);
}
