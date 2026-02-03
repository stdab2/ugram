import { useParams } from "react-router-dom";

export function UserPage() {
	const { id } = useParams();
	return <h1>User {id}</h1>;
}
