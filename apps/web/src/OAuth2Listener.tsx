import { useEffect } from "react";

export function OAuth2Listener() {
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			if (event.origin !== "http://localhost:4001") return;
			if (event.data.type === "oauth2_success") {
				const { token } = event.data;
				localStorage.setItem("token", token);
				window.location.href = "/";
			}
		};

		window.addEventListener("message", handleMessage);
		return () => {
			window.removeEventListener("message", handleMessage);
		};
	}, []);

	return null;
}
