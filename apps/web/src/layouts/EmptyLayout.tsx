import { Outlet } from "react-router-dom";
import { GoogleAnalyticsTracker } from "@/components/GoogleAnalyticsTracker";

function EmptyLayout() {
	return (
		<div className="min-h-screen bg-background font-sans antialiased">
			<main className="md:ml-16 pb-16 md:pb-0">
				<GoogleAnalyticsTracker />
				<Outlet />
			</main>
		</div>
	);
}

export default EmptyLayout;
