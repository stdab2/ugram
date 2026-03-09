import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApolloProvider } from "@apollo/client/react";
import { apolloClient } from "./lib/apollo/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./index.css";
import { Toaster } from "@/components/ui/Sonner";
import { OAuth2Listener } from "./OAuth2Listener";
import { AuthProvider } from "./AuthContext";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AuthProvider>
			<ApolloProvider client={apolloClient}>
				<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
					<OAuth2Listener />
					<RouterProvider router={router} />
					<Toaster />
				</ThemeProvider>
			</ApolloProvider>
		</AuthProvider>
	</StrictMode>
);
