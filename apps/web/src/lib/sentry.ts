import * as Sentry from "@sentry/react";

export const initSentry = () => {
	const dsn = import.meta.env.VITE_SENTRY_DSN;

	// Don't initialize if DSN is not configured
	if (!dsn) {
		console.warn("Sentry DSN not configured, skipping initialization");
		return;
	}

	// Extract hostname from GraphQL URL for trace propagation
	const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || "";
	const tracePropagationTargets: (string | RegExp)[] = ["localhost"];

	if (graphqlUrl) {
		try {
			const url = new URL(graphqlUrl);
			tracePropagationTargets.push(url.hostname);
		} catch {
			// Fallback if URL parsing fails
			tracePropagationTargets.push(/^http:\/\/localhost:4001\/graphql/);
		}
	}

	Sentry.init({
		dsn,
		environment: import.meta.env.MODE, // 'development' or 'production'
		release: `web@${import.meta.env.VITE_APP_VERSION || "dev"}`,

		integrations: [Sentry.browserTracingIntegration()],

		// Tracing
		tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
		tracePropagationTargets,

		sendDefaultPii: false,

		beforeSend(event) {
			if (event.request) {
				delete event.request.cookies;
				if (event.request.headers) {
					delete event.request.headers["Authorization"];
					delete event.request.headers["authorization"];
				}
			}
			return event;
		},
	});
};
