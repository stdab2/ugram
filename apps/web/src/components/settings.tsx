import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { UserDetail } from "@/components/user-detail";
import { FieldSeparator } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { useUserQuery, useUpdateUserMutation } from "@/generated/graphql";
import { useState, useEffect } from "react";

const USER_ID = 1; //TODO: Mettre vrai ID

export function Settings({ className, ...props }: React.ComponentProps<"div">) {
	const { data, loading, error } = useUserQuery({
		variables: { id: USER_ID },
	});

	const [updateUser] = useUpdateUserMutation();

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isAddingPhone, setIsAddingPhone] = useState(false);

	useEffect(() => {
		if (data?.user) {
			setFirstName(data.user.firstName);
			setLastName(data.user.lastName);
			setEmail(data.user.email);
			setPhoneNumber(data.user.phoneNumber);
			if (data.user.phoneNumber) {
				setIsAddingPhone(true);
			}
		}
	}, [data]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			await updateUser({
				variables: {
					id: USER_ID,
					firstName,
					lastName,
					email,
					phoneNumber,
				},
			});

			if (!phoneNumber) {
				setIsAddingPhone(false);
			}
		} catch (err) {
			console.error("Failed to update:", err);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (loading) return <p>Loading...</p>;

	if (error) return <p>{error.message}</p>;

	const user = data?.user;

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="overflow-hidden pt-2 pb-4 pl-4 pr-4 bg-muted">
				<CardContent className="p-0">
					<h1 className="text-2xl font-bold mb-2">Settings</h1>
					<FieldSeparator />
					<UserDetail
						className="mt-2"
						pictureUrl={user?.picture ?? ""}
						username={user?.userName ?? ""}
						fullname={`${user?.firstName} ${user?.lastName}`}
						memberSince={user?.createdAt ?? ""}
					/>
					<form className="mt-6 space-y-4" onSubmit={handleSubmit}>
						<div className="space-y-2">
							<Label htmlFor="firstname">First Name</Label>
							<Input
								id="firstname"
								type="text"
								placeholder="First Name"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								maxLength={20}
							/>
							<Label htmlFor="lastname">Last Name</Label>
							<Input
								id="lastname"
								type="text"
								placeholder="Last Name"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								maxLength={20}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="email@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="telephone">Phone Number</Label>
							{!phoneNumber && !isAddingPhone ? (
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsAddingPhone(true)}
								>
									Add Phone Number
								</Button>
							) : (
								<Input
									id="telephone"
									type="tel"
									placeholder="e.g. +11234567890"
									value={phoneNumber}
									onChange={(e) => setPhoneNumber(e.target.value)}
									pattern="^\+?[1-9][0-9]{7,14}$"
								/>
							)}
						</div>
						<div className="flex justify-end mt-8">
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Updating..." : "Update Profile"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
