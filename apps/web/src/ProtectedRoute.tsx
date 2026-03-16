import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";
import { useAuth } from "./AuthContext";

type Props = {
	children: React.ReactNode;
};

export function ProtectedRoute({ children }: Props) {
	const { userAuth, loading } = useAuth();
	const token = localStorage.getItem("token");

	useEffect(() => {
		if (!loading && !token) {
			toast.error("You must be logged in to access this page.");
		}
	}, [loading, token]);

	if (loading && token) {
		return null;
	}

	if (!token || !userAuth) {
		return <Navigate to="/login" replace />;
	}
	return <>{children}</>;
}
