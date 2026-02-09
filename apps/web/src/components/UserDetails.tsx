import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

interface UserDetailsProps {
	pictureUrl: string;
	username: string;
	fullname: string;
	memberSince: number;
	className?: string;
}

function timestampToDateString(timestamp: number): string {
	const date = new Date(timestamp);

	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

export function UserDetails({
	pictureUrl,
	username,
	fullname,
	memberSince,
	className,
}: UserDetailsProps) {
	return (
		<div className={cn("flex items-center gap-4", className)}>
			<Avatar className="h-24 w-24 flex-shrink-0">
				<AvatarImage src={pictureUrl} />
				<AvatarFallback>JD</AvatarFallback>
			</Avatar>
			<div>
				<p className="font-bold text-lg">{username}</p>
				<p className="text-gray-500 text-sm">{fullname}</p>
				<p className="text-gray-400 text-xs mt-1">
					Member since {timestampToDateString(memberSince)}
				</p>
			</div>
		</div>
	);
}
