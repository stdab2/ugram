import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApolloProvider } from "@apollo/client/react";
import { apolloClient } from "./lib/apollo/client";
import { initSentry } from "./lib/sentry";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./index.css";
import { Toaster } from "@/components/ui/Sonner";

// Initialize Sentry for error tracking and performance monitoring
initSentry();

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ApolloProvider client={apolloClient}>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<RouterProvider router={router} />
				<Toaster />
			</ThemeProvider>
		</ApolloProvider>
	</StrictMode>
);
