import { useEffect } from "react";
import { getApiOrigin } from "@/lib/utils";
import { trackEvent } from "@/lib/ga";

export function OAuth2Listener() {
	useEffect(() => {
		const expectedOrigin = getApiOrigin();

		const handleMessage = (event: MessageEvent) => {
			if (event.origin !== expectedOrigin) return;
			if (event.data.type === "oauth2_success") {
				const { token } = event.data;
				localStorage.setItem("token", token);
				trackEvent("login", { method: "google" });
				// Give GA a short window to dispatch the event before redirect.
				window.setTimeout(() => {
					window.location.href = "/";
				}, 150);
			}
		};

		window.addEventListener("message", handleMessage);
		return () => {
			window.removeEventListener("message", handleMessage);
		};
	}, []);

	return null;
}
