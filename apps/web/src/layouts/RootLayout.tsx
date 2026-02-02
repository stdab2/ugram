import { Outlet } from "react-router-dom";

function RootLayout() {
	return (
		<div className="min-h-screen bg-background font-sans antialiased">
			<main>
				<Outlet />
			</main>
		</div>
	);
}

export default RootLayout;
