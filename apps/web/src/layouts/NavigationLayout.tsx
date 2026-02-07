import { Outlet } from "react-router-dom";
import { Navigation } from "@/components/Navigation";

function NavigationLayout() {
	return (
		<div className="min-h-screen bg-background font-sans antialiased">
			<Navigation />
			<main className="md:ml-16 pb-16 md:pb-0">
				<Outlet />
			</main>
		</div>
	);
}

export default NavigationLayout;
