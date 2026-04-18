import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import { timestampToDateString } from "@/lib/utils";
import { getImageUrl } from "@/lib/utils";
import { Calendar, LayoutGrid, UserCheck, Users } from "lucide-react";
import type { UserByUserNameQuery } from "@/generated/graphql";
import type { ProfileView } from "./ProfileContentTypes";

type ProfileUser = NonNullable<UserByUserNameQuery["userByUserName"]>;

interface ProfileHeaderCardProps {
	user: ProfileUser;
	isOwnProfile: boolean;
	activeView: ProfileView;
	displayedIsFollowedByCurrentUser: boolean;
	displayedFollowerCount: number;
	followingCount: number;
	isFollowActionLoading: boolean;
	onOpenSettings: () => void;
	onToggleFollow: () => void;
	onChangeView: (view: ProfileView) => void;
}

export function ProfileHeaderCard({
	user,
	isOwnProfile,
	activeView,
	displayedIsFollowedByCurrentUser,
	displayedFollowerCount,
	followingCount,
	isFollowActionLoading,
	onOpenSettings,
	onToggleFollow,
	onChangeView,
}: ProfileHeaderCardProps) {
	return (
		<Card className="p-6 md:p-8 mb-8">
			<div className="flex flex-col md:flex-row gap-6 md:gap-8">
				<div className="flex justify-center md:justify-start">
					<Avatar className="h-32 w-32 md:h-40 md:w-40">
						<AvatarImage src={user.picture ? getImageUrl(user.picture) : undefined} />
						<AvatarFallback className="text-3xl">
							{user.firstName[0] + user.lastName[0]}
						</AvatarFallback>
					</Avatar>
				</div>

				<div className="flex-1 space-y-4">
					<div className="space-y-2">
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0">
								<h1 className="text-2xl font-bold">{user.userName}</h1>
								<p className="text-lg text-foreground">
									{user.firstName} {user.lastName}
								</p>
							</div>
							{isOwnProfile && (
								<Button
									variant="outline"
									size="sm"
									onClick={onOpenSettings}
									className="w-fit shrink-0"
								>
									Edit Profile
								</Button>
							)}
							{!isOwnProfile && (
								<Button
									size="sm"
									variant={displayedIsFollowedByCurrentUser ? "outline" : "default"}
									disabled={isFollowActionLoading}
									onClick={onToggleFollow}
									className="w-fit shrink-0"
								>
									{displayedIsFollowedByCurrentUser ? "Unfollow" : "Follow"}
								</Button>
							)}
						</div>
					</div>

					<div className="flex gap-6">
						<Button
							variant={activeView === "posts" ? "default" : "outline"}
							size="sm"
							onClick={() => onChangeView("posts")}
							className="gap-2"
						>
							<LayoutGrid className="h-4 w-4" />
							Posts
						</Button>
						<Button
							variant={activeView === "followers" ? "default" : "outline"}
							size="sm"
							onClick={() => onChangeView("followers")}
							className="gap-2"
						>
							<Users className="h-4 w-4" />
							Followers ({displayedFollowerCount})
						</Button>
						<Button
							variant={activeView === "following" ? "default" : "outline"}
							size="sm"
							onClick={() => onChangeView("following")}
							className="gap-2"
						>
							<UserCheck className="h-4 w-4" />
							Following ({followingCount})
						</Button>
					</div>
					<Separator />
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm">
							<Calendar className="h-4 w-4 text-muted-foreground" />
							<span>Member since {timestampToDateString(+user.createdAt)}</span>
						</div>
					</div>
				</div>
			</div>
		</Card>
	);
}
