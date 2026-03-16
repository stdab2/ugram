import { useEffect } from "react";
import { getApiOrigin } from "@/lib/utils";

export function OAuth2Listener() {
	useEffect(() => {
		const expectedOrigin = getApiOrigin();

		const handleMessage = (event: MessageEvent) => {
			if (event.origin !== expectedOrigin) return;
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
