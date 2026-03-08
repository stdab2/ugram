import { Link, useLocation, useNavigate } from "react-router-dom";
import {
	Home,
	Search,
	PlusSquare,
	MessageCircle,
	Bell,
	Settings,
	LogOut,
	User,
} from "lucide-react";
import { CURRENT_USERNAME } from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Badge } from "@/components/ui/Badge";
import { cn, getImageUrl } from "@/lib/utils";
import { useUserByUserNameQuery } from "@/generated/graphql";

const navItems = [
	{ icon: Home, label: "Home", href: "/" },
	{ icon: Search, label: "Search", href: "/search" },
	{ icon: PlusSquare, label: "Create", href: "/create" },
	{ icon: MessageCircle, label: "Messages", href: "/messages" },
];

export function Navigation() {
	const location = useLocation();
	const navigate = useNavigate();
	const pathname = location.pathname;

	// Fetch current user data
	const { data: userData } = useUserByUserNameQuery({
		variables: { userName: CURRENT_USERNAME },
	});

	const user = userData?.userByUserName;
	const avatarFallback = user ? user.firstName[0] + user.lastName[0] : "JD";
	const avatarUrl = getImageUrl(user?.picture);

	const logout = () => {
		localStorage.removeItem("token");
		navigate("/login");
	};

	return (
		<>
			{/* Desktop Sidebar */}
			<aside className="hidden md:flex fixed left-0 top-0 h-screen bg-background border-r z-50 group/sidebar hover:w-60 w-16 transition-all duration-300">
				<nav className="flex flex-col w-full p-2">
					{/* Accueil en haut */}
					<div className="flex flex-col gap-2 mb-4">
						<Link
							to="/"
							className={cn(
								"flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-all duration-200 hover:scale-105",
								pathname === "/" && "bg-accent text-accent-foreground font-medium"
							)}
						>
							<Home className="w-6 h-6 flex-shrink-0" />
							<span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
								Home
							</span>
						</Link>
					</div>

					{/* Section du milieu - Search, CreatePost, Messages, Notifications, Profil */}
					<div className="flex flex-col gap-2 flex-1 justify-center">
						{navItems.slice(1).map((item) => {
							const isActive = pathname === item.href;
							return (
								<Link
									key={item.href}
									to={item.href}
									className={cn(
										"flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-all duration-200 hover:scale-105",
										isActive && "bg-accent text-accent-foreground font-medium"
									)}
								>
									<item.icon className="w-6 h-6 flex-shrink-0" />
									<span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
										{item.label}
									</span>
								</Link>
							);
						})}

						<Link
							to="/notifications"
							className={cn(
								"flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-all duration-200 hover:scale-105",
								pathname === "/notifications" && "bg-accent text-accent-foreground font-medium"
							)}
						>
							<Bell className="w-6 h-6 flex-shrink-0" />
							<span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
								Notifications
							</span>
						</Link>

						<Link
							to={`/profile/${CURRENT_USERNAME}`}
							className={cn(
								"flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-all duration-200 hover:scale-105",
								pathname === `/profile/${CURRENT_USERNAME}` &&
									"bg-accent text-accent-foreground font-medium"
							)}
						>
							<Avatar className="h-8 w-8 flex-shrink-0">
								<AvatarImage src={avatarUrl} />
								<AvatarFallback>{avatarFallback}</AvatarFallback>
							</Avatar>
							<span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
								Profile
							</span>
						</Link>
					</div>

					{/* Paramètres et Se déconnecter en bas */}
					<div className="flex flex-col gap-2 mt-4">
						<Link
							to="/settings"
							className={cn(
								"flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-all duration-200 hover:scale-105",
								pathname === "/settings" && "bg-accent text-accent-foreground font-medium"
							)}
						>
							<Settings className="w-6 h-6 flex-shrink-0" />
							<span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
								Settings
							</span>
						</Link>
						<button
							className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-all duration-200 hover:scale-105 text-left"
							onClick={logout}
						>
							<LogOut className="w-6 h-6 flex-shrink-0" />
							<span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
								Log Out
							</span>
						</button>
					</div>
				</nav>
			</aside>

			{/* Mobile Bottom Navigation */}
			<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
				<div className="flex justify-around items-center h-20 px-2">
					{navItems.map((item) => {
						const isActive = pathname === item.href;
						return (
							<Link
								key={item.href}
								to={item.href}
								aria-label={item.label}
								className={cn(
									"flex items-center justify-center h-16 w-16 rounded-lg hover:bg-accent transition-all duration-200 hover:scale-110",
									isActive && "text-primary"
								)}
							>
								<item.icon className="w-7 h-7" strokeWidth={isActive ? 2.5 : 2} />
							</Link>
						);
					})}
					<DropdownMenu>
						<DropdownMenuTrigger
							aria-label="User menu"
							className="flex items-center justify-center h-16 w-16 rounded-lg hover:bg-accent transition-all duration-200 hover:scale-110 relative"
						>
							<Avatar className="h-9 w-9">
								<AvatarImage src={avatarUrl} />
								<AvatarFallback>{avatarFallback}</AvatarFallback>
							</Avatar>
							<Badge
								variant="destructive"
								className="absolute top-2 right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
							>
								3
							</Badge>
						</DropdownMenuTrigger>
						<DropdownMenuContent side="top" align="end" className="w-56">
							<DropdownMenuItem onClick={() => navigate("/notifications")}>
								<Bell className="mr-2 h-4 w-4" />
								Notifications
								<Badge variant="secondary" className="ml-auto">
									3
								</Badge>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => navigate(`/profile/${CURRENT_USERNAME}`)}>
								<User className="mr-2 h-4 w-4" />
								Profile
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => navigate("/settings")}>
								<Settings className="mr-2 h-4 w-4" />
								Settings
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem>Log Out</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</nav>
		</>
	);
}
