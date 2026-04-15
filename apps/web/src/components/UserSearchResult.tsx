import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import type { UserQuery, SearchQuery } from "@/generated/graphql";
import { Link } from "react-router-dom";
import { getImageUrl } from "@/lib/utils";

interface UserSearchResultProps {
	user: UserQuery["user"] | SearchQuery["search"]["users"][0] | null;
	onPostClick?: (postId: string | number) => void;
}

export function UserSearchResult({ user, onPostClick }: UserSearchResultProps) {
	// Handle null user early
	if (!user) {
		return null;
	}

	const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown User";

	// Get user's recent posts (up to 3)
	const recentPosts = user.posts?.slice(0, 3) || [];
	const totalPosts = user.posts?.length || 0;
	const followerCount = user.followerCount ?? 0;
	const totalLikes = user.posts?.reduce((sum, post) => sum + (post.likeCount || 0), 0) || 0;
	return (
		<Link to={`/profile/${user.userName}`}>
			<Card className="p-4 hover:bg-muted/50 transition-all duration-200 cursor-pointer hover:scale-[1.01] hover:shadow-md">
				<div className="flex flex-col md:flex-row gap-4">
					{/* User Info */}
					<div className="flex items-center gap-4 md:flex-1">
						<Avatar className="h-12 w-12">
							<AvatarImage src={user.picture ? getImageUrl(user.picture) : undefined} />
							<AvatarFallback>{user.firstName[0] + user.lastName[0]}</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<p className="font-semibold text-sm truncate">{user.userName}</p>
							<p className="text-xs text-muted-foreground truncate mb-2">{fullName}</p>
							<div className="flex gap-4 text-xs">
								<div>
									<span className="font-semibold">{followerCount}</span>
									<span className="text-muted-foreground ml-1">followers</span>
								</div>
								<div>
									<span className="font-semibold">{totalPosts}</span>
									<span className="text-muted-foreground ml-1">posts</span>
								</div>
								<div>
									<span className="font-semibold">{totalLikes}</span>
									<span className="text-muted-foreground ml-1">likes</span>
								</div>
							</div>
						</div>
					</div>

					{/* Post Previews - Desktop only */}
					{recentPosts.length > 0 && (
						<div className="hidden md:flex gap-1">
							{recentPosts.map((post) => (
								<button
									key={post.id}
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										e.preventDefault();
										onPostClick?.(post.id);
									}}
									className="w-20 h-20 rounded-md overflow-hidden hover:opacity-80 transition-opacity"
								>
									<img
										src={getImageUrl(post.imageUrl || "")}
										alt=""
										className="w-full h-full object-cover"
									/>
								</button>
							))}
						</div>
					)}
				</div>
			</Card>
		</Link>
	);
}
