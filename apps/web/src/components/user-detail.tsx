import { UserPicture } from "@/components/user-picture";

interface UserDetailProps {
	pictureUrl: string;
	username: string;
	fullname: string;
}

export function UserDetail({ pictureUrl, username, fullname }: UserDetailProps) {
	return (
		<div className="flex items-center gap-4">
			<UserPicture src={pictureUrl} size="lg" />
			<div>
				<p className="font-bold text-lg">{username}</p>
				<p className="text-gray-500 text-sm">{fullname}</p>
			</div>
		</div>
	);
}
