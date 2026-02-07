import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/Empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/InputGroup";
import { Kbd } from "@/components/ui/Kbd";
import { SearchIcon } from "lucide-react";

export function NotFoundPage() {
	return (
		<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
			<Empty>
				<EmptyHeader>
					<EmptyTitle>404 - Not Found</EmptyTitle>
					<EmptyDescription>
						The page you&apos;re looking for doesn&apos;t exist. Try searching for what you need
						below.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<InputGroup className="sm:w-3/4">
						<InputGroupInput placeholder="Try searching for pages..." />
						<InputGroupAddon>
							<SearchIcon />
						</InputGroupAddon>
						<InputGroupAddon align="inline-end">
							<Kbd>/</Kbd>
						</InputGroupAddon>
					</InputGroup>
					<EmptyDescription>
						Need help? <a href="#">Contact support</a>
					</EmptyDescription>
				</EmptyContent>
			</Empty>
		</div>
	);
}
