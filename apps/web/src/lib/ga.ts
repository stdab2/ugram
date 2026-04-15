const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
const gtagScriptId = "ga4-gtag-script";

declare global {
	interface Window {
		dataLayer: unknown[];
		gtag?: (...args: unknown[]) => void;
	}
}

const isBrowser = () => typeof window !== "undefined";

export const isGoogleAnalyticsEnabled = () => Boolean(measurementId);

export const initGoogleAnalytics = () => {
	if (!isBrowser() || !measurementId) {
		return;
	}

	if (!window.dataLayer) {
		window.dataLayer = [];
	}

	if (!window.gtag) {
		// Match Google's official snippet behavior by pushing the function
		// arguments object, not a plain array, to maximize compatibility.
		window.gtag = function gtag(..._args: unknown[]) {
			window.dataLayer.push(arguments);
		};
		window.gtag("js", new Date());
		// For SPA apps we send page views manually on route changes.
		window.gtag("config", measurementId, { send_page_view: false });
	}

	if (!document.getElementById(gtagScriptId)) {
		const script = document.createElement("script");
		script.id = gtagScriptId;
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
		document.head.appendChild(script);
	}
};

export const trackPageView = (pagePath: string, pageTitle?: string) => {
	if (!isBrowser() || !measurementId || !window.gtag) {
		return;
	}

	window.gtag("event", "page_view", {
		page_path: pagePath,
		page_title: pageTitle,
		page_location: window.location.href,
		send_to: measurementId,
	});
};

export const trackEvent = (
	eventName: string,
	params?: Record<string, string | number | boolean | undefined>
) => {
	if (!isBrowser() || !measurementId || !window.gtag) {
		return;
	}

	window.gtag("event", eventName, {
		send_to: measurementId,
		...params,
	});
};
