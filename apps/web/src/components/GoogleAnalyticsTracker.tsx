import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
	initGoogleAnalytics,
	isGoogleAnalyticsEnabled,
	trackPageView,
} from "@/lib/ga";

export function GoogleAnalyticsTracker() {
	const location = useLocation();

	useEffect(() => {
		initGoogleAnalytics();
	}, []);

	useEffect(() => {
		if (!isGoogleAnalyticsEnabled()) {
			return;
		}

		const pagePath = `${location.pathname}${location.search}${location.hash}`;
		trackPageView(pagePath, document.title);
	}, [location.pathname, location.search, location.hash]);

	return null;
}
