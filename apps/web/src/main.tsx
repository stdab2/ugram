import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./lib/apollo/client";
import { initSentry } from "./lib/sentry";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { ThemeProvider } from "@/components/ThemeProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ErrorProvider } from "@/contexts/ErrorContext";
import "./index.css";
import { Toaster } from "@/components/ui/Sonner";
import { OAuth2Listener } from "./OAuth2Listener";
import { AuthProvider } from "./AuthContext";

// Initialize Sentry for error tracking and performance monitoring
initSentry();

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ErrorBoundary>
      <AuthProvider>
        <ApolloProvider client={apolloClient}>
          <ErrorProvider>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <OAuth2Listener />
              <RouterProvider router={router} />
              <Toaster />
            </ThemeProvider>
          </ErrorProvider>
        </ApolloProvider>
      <AuthProvider>
		</ErrorBoundary>
	</StrictMode>
);
