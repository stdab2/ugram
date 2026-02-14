import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { UserDetails } from "@/components/UserDetails";
import { FieldSeparator } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

export function UserSettings({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="overflow-hidden pt-2 pb-4 pl-4 pr-4">
				<CardContent className="p-0">
					<h1 className="text-2xl font-bold mb-2">Settings</h1>
					<FieldSeparator />
					<UserDetails
						className="mt-2"
						pictureUrl="/avatar.jpg" // TODO: api call
						username="johnnyd23" // TODO: api call
						fullname="John Doe" // TODO: api call
						memberSince={1622505600000} // timestamp in ms // TODO: api call
					/>
					<form className="mt-6 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="firstname">First Name</Label>
							<Input
								id="firstname"
								type="text"
								placeholder="First Name"
								defaultValue="John" // TODO: api call
								maxLength={20}
							/>
							<Label htmlFor="lastname">Last Name</Label>
							<Input
								id="lastname"
								type="text"
								placeholder="Last Name"
								defaultValue="Doe" // TODO: api call
								maxLength={20}
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
						<div className="flex justify-end mt-8">
							<Button type="submit">Update Profile</Button> {/* TODO: api call */}
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
