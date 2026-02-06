import { useParams } from "react-router-dom";

export function ProfilePage() {
	const { id } = useParams();
	return (
		<div className="p-8">
			<h1 className="text-3xl font-bold">Profile</h1>
			<p className="mt-4 text-muted-foreground">Implement user ({id}) profile</p>
		</div>
	);
}
