import { useParams } from "react-router-dom";

export function ProfilePage() {
	const { id } = useParams();
	return <h1>Profile: {id}</h1>;
}
