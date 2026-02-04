import { UserPicture } from "@/components/user-picture";

interface UserDetailProps {
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

export function UserDetail({
	pictureUrl,
	username,
	fullname,
	memberSince,
	className,
}: UserDetailProps) {
	return (
		<div className={`flex items-center gap-4 ${className}`}>
			<UserPicture src={pictureUrl} size="lg" />
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
