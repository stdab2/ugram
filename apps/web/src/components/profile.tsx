import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { UserDetail } from "@/components/user-detail";
import { Button } from "@/components/ui/button";

export function Profile({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="overflow-hidden pt-2 pb-4 pl-4 pr-4">
				<CardContent className="p-0">
					<h1 className="text-2xl font-bold">Edit profile</h1>
					<div className="border-3 border-gray-700 rounded-md p-2 mt-4 grid md:grid-cols-2">
						<UserDetail pictureUrl="/placeholder.svg" username="username" fullname="full name" />
						<div className="flex justify-end items-center">
							<Button>Change name</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
