import { useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import { Button } from "@/components/ui/Button";
import { PostPreview } from "@/components/Post";
import { PostModal } from "@/components/PostModal";
import { mockUserProfile, mockPosts } from "@/lib/mockData";
import { Mail, Phone, Calendar } from "lucide-react";
import { useState } from "react";

export function ProfilePage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [selectedPost, setSelectedPost] = useState<(typeof mockPosts)[0] | null>(null);

	// Check if this is the current user's profile
	const isOwnProfile = id === mockUserProfile.username || !id;

	// Filter posts by the current user (john_doe for now)
	const userPosts = mockPosts.filter((post) => post.author.username === mockUserProfile.username);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
	};

	return (
		<div className="w-full min-h-screen bg-background pb-20 md:pb-0">
			<div className="max-w-5xl mx-auto px-4 py-8">
				{/* Profile Header */}
				<Card className="p-6 md:p-8 mb-8">
					<div className="flex flex-col md:flex-row gap-6 md:gap-8">
						{/* Avatar */}
						<div className="flex justify-center md:justify-start">
							<Avatar className="h-32 w-32 md:h-40 md:w-40">
								<AvatarImage src="/avatar.jpg" />
								<AvatarFallback className="text-3xl">
									{mockUserProfile.avatarFallback}
								</AvatarFallback>
							</Avatar>
						</div>

						{/* Profile Info */}
						<div className="flex-1 space-y-4">
							<div className="space-y-2">
								<div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
									<h1 className="text-2xl font-bold">{mockUserProfile.username}</h1>
									{isOwnProfile && (
										<Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
											Edit Profile
										</Button>
									)}
								</div>
								<p className="text-lg text-foreground">
									{mockUserProfile.firstName} {mockUserProfile.lastName}
								</p>
							</div>

							{/* Stats */}
							<div className="flex gap-6">
								<div className="text-center">
									<p className="font-semibold text-lg">{mockUserProfile.postsCount}</p>
									<p className="text-sm text-muted-foreground">Posts</p>
								</div>
								<div className="text-center">
									<p className="font-semibold text-lg">
										{mockUserProfile.followersCount.toLocaleString()}
									</p>
									<p className="text-sm text-muted-foreground">Followers</p>
								</div>
								<div className="text-center">
									<p className="font-semibold text-lg">
										{mockUserProfile.followingCount.toLocaleString()}
									</p>
									<p className="text-sm text-muted-foreground">Following</p>
								</div>
							</div>

							{/* Bio */}
							{mockUserProfile.bio && <p className="text-sm">{mockUserProfile.bio}</p>}

							<Separator />

							{/* Contact Info */}
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-sm">
									<Mail className="h-4 w-4 text-muted-foreground" />
									<span>{mockUserProfile.email}</span>
								</div>
								<div className="flex items-center gap-2 text-sm">
									<Phone className="h-4 w-4 text-muted-foreground" />
									<span>{mockUserProfile.phoneNumber}</span>
								</div>
								<div className="flex items-center gap-2 text-sm">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									<span>Joined {formatDate(mockUserProfile.joinedDate)}</span>
								</div>
							</div>
						</div>
					</div>
				</Card>

				{/* Posts Grid */}
				<div>
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-semibold">Posts</h2>
						<Badge variant="secondary">{userPosts.length} posts</Badge>
					</div>
					<div className="grid grid-cols-3 gap-1 md:gap-2">
						{userPosts.map((post) => (
							<PostPreview
								key={post.id}
								imageUrl={post.imageUrl}
								onClick={() => setSelectedPost(post)}
							/>
						))}
					</div>
				</div>

				{/* Post Modal */}
				{selectedPost && (
					<PostModal
						open={!!selectedPost}
						onOpenChange={(open) => !open && setSelectedPost(null)}
						post={selectedPost}
					/>
				)}
			</div>
		</div>
	);
}
