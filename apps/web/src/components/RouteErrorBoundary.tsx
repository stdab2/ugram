import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";
import ErrorFallback from "@/components/ErrorFallback";

export default function RouteErrorBoundary() {
	const routeError = useRouteError();
	const navigate = useNavigate();

	let error: Error;

	if (isRouteErrorResponse(routeError)) {
		let message = "Route error";

		if (routeError.statusText) {
			message = routeError.statusText;
		} else {
			const data = routeError.data;

			if (typeof data === "string") {
				message = data;
			} else if (data != null) {
				try {
					const serialized = JSON.stringify(data);
					if (serialized.length > 0) {
						message = serialized;
					}
				} catch {
					// keep default message
				}
			}
		}

		error = new Error(message);
	} else if (routeError instanceof Error) {
		error = routeError;
	} else {
		error = new Error("Unexpected application error");
	}

	return <ErrorFallback error={error} onReset={() => navigate(0)} />;
}
