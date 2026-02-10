import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import type { UserUgram } from "@/generated/graphql";
import { Link } from "react-router-dom";
import { getImageUrl } from "@/lib/utils";

interface UserSearchResultProps {
	user: UserUgram;
}

export function UserSearchResult({ user }: UserSearchResultProps) {
	const avatarFallback = user.firstName[0] + user.lastName[0];
	const fullName = `${user.firstName} ${user.lastName}`;

	return (
		<Link to={`/profile/${user.userName}`}>
			<Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
				<div className="flex flex-col md:flex-row gap-4">
					{/* User Info */}
					<div className="flex items-center gap-4 md:flex-1">
						<Avatar className="h-12 w-12">
							<AvatarImage src={getImageUrl(user.picture)} />
							<AvatarFallback>{avatarFallback}</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<p className="font-semibold text-sm truncate">{user.userName}</p>
							<p className="text-xs text-muted-foreground truncate mb-2">{fullName}</p>
							<div className="flex gap-4 text-xs">
								<div>
									<span className="font-semibold">0</span>
									<span className="text-muted-foreground ml-1">posts</span>
								</div>
								<div>
									<span className="font-semibold">0</span>
									<span className="text-muted-foreground ml-1">likes</span>
								</div>
								<div>
									<span className="font-semibold">0</span>
									<span className="text-muted-foreground ml-1">comments</span>
								</div>
							</div>
						</div>
					</div>

					{/* Post Previews - Desktop only */}
					{/* TODO: Add recentPosts to GraphQL query */}
					<div className="hidden md:flex gap-1">
						{/* Placeholder for when recentPosts are available */}
					</div>
				</div>
			</Card>
		</Link>
	);
}
