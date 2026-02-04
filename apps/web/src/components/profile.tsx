import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { UserDetail } from "@/components/user-detail";
import { FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function Profile({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="overflow-hidden pt-2 pb-4 pl-4 pr-4">
				<CardContent className="p-0">
					<h1 className="text-2xl font-bold mb-2">Your Profile</h1>
					<FieldSeparator />
					<UserDetail
						className="mt-2"
						pictureUrl="/placeholder.svg" // TODO: api call
						username="johnnyd23" // TODO: api call
						fullname="John Doe" // TODO: api call
						memberSince={1622505600000} // timestamp in ms // TODO: api call
					/>
					<form className="mt-6 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								type="text"
								placeholder="Full Name"
								defaultValue="John Doe" // TODO: api call
								maxLength={30}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="email@example.com"
								defaultValue="johnnyd@email.com" // TODO: api call
								pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$" // Format verification
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="telephone">Phone Number</Label>
							<Input
								id="telephone"
								type="tel"
								placeholder="e.g. +1 123-456-7890"
								defaultValue="+1 555-123-4567" // TODO: api call
								pattern="^\+\d{1,3}\s\d{1,4}-\d{1,4}-\d{4}$" // Format verification
							/>
						</div>
						<div className="flex justify-end mt-4">
							<Button type="submit">Update Profile</Button> // TODO: api call
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
