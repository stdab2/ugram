import { createBrowserRouter } from "react-router-dom";
import App from "./App";

import { FeedPage } from "./pages/FeedPage";
import { ProfilePage } from "./pages/ProfilePage";
import { NotFoundPage } from "./pages/NotFoundPage";

export const router = createBrowserRouter([
	{
		element: <App />,
		children: [
			{ path: "/", element: <FeedPage /> },
			{ path: "/profile/:id", element: <ProfilePage /> },
			{ path: "*", element: <NotFoundPage /> },
		],
	},
]);
