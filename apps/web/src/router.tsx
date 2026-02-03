import { createBrowserRouter } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";

import { FeedPage } from "@/pages/FeedPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { UserPage } from "@/pages/UserPage";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
	{
		element: <RootLayout />,
		children: [
			{ path: "/", element: <FeedPage /> },
			{ path: "/profile", element: <ProfilePage /> },
			{ path: "/user/:id", element: <UserPage /> },
			{ path: "/login", element: <LoginPage /> },
			{ path: "/signup", element: <SignupPage /> },
			{ path: "*", element: <NotFoundPage /> },
		],
	},
]);
