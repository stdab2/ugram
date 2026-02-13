import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/Empty";
import { Button } from "@/components/ui/Button";
import { Home, Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CURRENT_USERNAME } from "@/lib/constants";

export function NotFoundPage() {
	const navigate = useNavigate();

	return (
		<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
			<Empty>
				<EmptyHeader>
					<EmptyTitle>404 - Page Not Found</EmptyTitle>
					<EmptyDescription>
						The page you&apos;re looking for doesn&apos;t exist or has been moved.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Button onClick={() => navigate("/")} variant="default">
							<Home className="mr-2 h-4 w-4" />
							Go to Home
						</Button>
						<Button onClick={() => navigate("/search")} variant="outline">
							<Search className="mr-2 h-4 w-4" />
							Search
						</Button>
						<Button onClick={() => navigate(`/profile/${CURRENT_USERNAME}`)} variant="outline">
							<User className="mr-2 h-4 w-4" />
							My Profile
						</Button>
					</div>
				</EmptyContent>
			</Empty>
		</div>
	);
}
