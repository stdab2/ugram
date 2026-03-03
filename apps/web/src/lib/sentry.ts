import * as Sentry from "@sentry/react";

export const initSentry = () => {
	const dsn = import.meta.env.VITE_SENTRY_DSN;

	// Ne pas initialiser si pas de DSN configuré
	if (!dsn) {
		console.warn("Sentry DSN not configured, skipping initialization");
		return;
	}

	Sentry.init({
		dsn,
		environment: import.meta.env.MODE, // 'development' ou 'production'
		release: `web@${import.meta.env.VITE_APP_VERSION || "dev"}`,

		integrations: [Sentry.browserTracingIntegration()],

		// Tracing
		tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
		tracePropagationTargets: [
			"localhost",
			/^http:\/\/localhost:4001\/graphql/, // API GraphQL locale
			/^http:\/\/api:4000\/graphql/, // API GraphQL dans Docker
		],

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
