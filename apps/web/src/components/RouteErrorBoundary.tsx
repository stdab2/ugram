import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";
import ErrorFallback from "@/components/ErrorFallback";

export default function RouteErrorBoundary() {
	const routeError = useRouteError();
	const navigate = useNavigate();

	let error: Error;

	if (isRouteErrorResponse(routeError)) {
		error = new Error(routeError.statusText || routeError.data || "Route error");
	} else if (routeError instanceof Error) {
		error = routeError;
	} else {
		error = new Error("Unexpected application error");
	}

	return <ErrorFallback error={error} onReset={() => navigate(0)} />;
}
