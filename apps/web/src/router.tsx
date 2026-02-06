import { createBrowserRouter } from "react-router-dom";
import NavigationLayout from "@/layouts/NavigationLayout";
import EmptyLayout from "@/layouts/EmptyLayout";

import { FeedPage } from "@/pages/FeedPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { SearchPage } from "@/pages/SearchPage";
import { CreatePostPage } from "@/pages/CreatePostPage";
import { MessagesPage } from "@/pages/MessagesPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { NotificationsPage } from "@/pages/NotificationsPage";

export const router = createBrowserRouter([
	{
		element: <NavigationLayout />,
		children: [
			{ path: "/", element: <FeedPage /> },
			{ path: "/search", element: <SearchPage /> },
			{ path: "/create", element: <CreatePostPage /> },
			{ path: "/messages", element: <MessagesPage /> },
			{ path: "/notifications", element: <NotificationsPage /> },
			{ path: "/settings", element: <SettingsPage /> },
			{ path: "/profile/:id", element: <ProfilePage /> },
		],
	},
	{
		element: <EmptyLayout />,
		children: [
			{ path: "/login", element: <LoginPage /> },
			{ path: "/signup", element: <SignupPage /> },
			{ path: "*", element: <NotFoundPage /> },
		],
	},
]);
