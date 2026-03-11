import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";

type Props = {
	children: React.ReactNode;
};

export function ProtectedRoute({ children }: Props) {
	const token = localStorage.getItem("token");

	useEffect(() => {
		if (!token) {
			toast.error("You must be logged in to access this page.");
		}
	}, [token]);

	if (!token) {
		return <Navigate to="/login" replace />;
	}
	return <>{children}</>;
}
