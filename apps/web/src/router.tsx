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
import { PostPage } from "@/pages/PostPage";
import { EditPostPage } from "@/pages/EditPostPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { ProtectedRoute } from "./ProtectedRoute";
import RouteErrorBoundary from "@/components/RouteErrorBoundary";

export const router = createBrowserRouter([
	{
		element: <NavigationLayout />,
		errorElement: <RouteErrorBoundary />,
		children: [
			{
				path: "/",
				element: (
					<ProtectedRoute>
						<FeedPage />
					</ProtectedRoute>
				),
			},
			{
				path: "/search",
				element: (
					<ProtectedRoute>
						<SearchPage />
					</ProtectedRoute>
				),
			},
			{
				path: "/create",
				element: (
					<ProtectedRoute>
						<CreatePostPage />
					</ProtectedRoute>
				),
			},
			{
				path: "/post/:id",
				element: (
					<ProtectedRoute>
						<PostPage />
					</ProtectedRoute>
				),
			},
			{
				path: "/post/:id/edit",
				element: (
					<ProtectedRoute>
						<EditPostPage />
					</ProtectedRoute>
				),
			},
			{
				path: "/notifications",
				element: (
					<ProtectedRoute>
						<NotificationsPage />
					</ProtectedRoute>
				),
			},
			{
				path: "/settings",
				element: (
					<ProtectedRoute>
						<SettingsPage />
					</ProtectedRoute>
				),
			},
			{
				path: "/profile/:username",
				element: (
					<ProtectedRoute>
						<ProfilePage />
					</ProtectedRoute>
				),
			},
		],
	},
	{
		element: <EmptyLayout />,
		errorElement: <RouteErrorBoundary />,
		children: [
			{ path: "/login", element: <LoginPage /> },
			{ path: "/signup", element: <SignupPage /> },
			{ path: "*", element: <NotFoundPage /> },
		],
	},
]);
