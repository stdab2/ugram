import { Outlet } from "react-router-dom";

function EmptyLayout() {
	return (
		<div className="min-h-screen bg-background font-sans antialiased">
			<main className="md:ml-16 pb-16 md:pb-0">
				<Outlet />
			</main>
		</div>
	);
}

export default EmptyLayout;
