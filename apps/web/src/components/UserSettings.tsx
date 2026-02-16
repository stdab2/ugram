import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { UserDetails } from "@/components/UserDetails";
import { FieldSeparator } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { useUserQuery, useUpdateUserMutation } from "@/generated/graphql";
import { useState, useEffect } from "react";
import { z } from "zod";
import { settingsSchema, type SettingsFormData } from "@/lib/settingsSchema";
import { getImageUrl } from "@/lib/utils";

const USER_ID = 1; //TODO: Mettre vrai ID

export function UserSettings({ className, ...props }: React.ComponentProps<"div">) {
	const { data, loading, error } = useUserQuery({
		variables: { id: USER_ID },
	});

	const [updateUser] = useUpdateUserMutation();

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<Partial<Record<keyof SettingsFormData, string>>>({});
	const [showSuccess, setShowSuccess] = useState(false);

	useEffect(() => {
		if (data?.user) {
			setFirstName(data.user.firstName);
			setLastName(data.user.lastName);
			setEmail(data.user.email);
			setPhoneNumber(data.user.phoneNumber);
		}
	}, [data]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});
		setShowSuccess(false);
		setIsSubmitting(true);

		try {
			const validatedData = settingsSchema.parse({
				firstName,
				lastName,
				email,
				phoneNumber,
			});

			await updateUser({
				variables: {
					id: USER_ID,
					firstName: validatedData.firstName,
					lastName: validatedData.lastName,
					email: validatedData.email,
					phoneNumber: validatedData.phoneNumber,
				},
			});

			setShowSuccess(true);
			setTimeout(() => setShowSuccess(false), 3000);
		} catch (err) {
			if (err instanceof z.ZodError) {
				const fieldErrors: Partial<Record<keyof SettingsFormData, string>> = {};

				err.issues.forEach((error) => {
					const fieldName = error.path[0] as keyof SettingsFormData;

					if (fieldName) {
						fieldErrors[fieldName] = error.message;
					}
				});

				setErrors(fieldErrors);
			} else {
				console.error("Failed to update:", err);
			}
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
					<UserDetails
						className="mt-2"
						pictureUrl={getImageUrl(user?.picture) ?? ""}
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
								autoComplete="given-name"
								placeholder="First Name"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								maxLength={20}
								className={errors.firstName ? "border-red-500" : ""}
							/>
							{errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
							<Label htmlFor="lastname">Last Name</Label>
							<Input
								id="lastname"
								type="text"
								autoComplete="family-name"
								placeholder="Last Name"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								maxLength={20}
								className={errors.lastName ? "border-red-500" : ""}
							/>
							{errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								placeholder="email@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className={errors.email ? "border-red-500" : ""}
							/>
							{errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
						</div>
						<div className="space-y-2">
							<Label htmlFor="telephone">Phone Number</Label>
							<Input
								id="telephone"
								type="tel"
								placeholder="e.g. +12223334444"
								value={phoneNumber}
								onChange={(e) => setPhoneNumber(e.target.value)}
								className={errors.phoneNumber ? "border-red-500" : ""}
							/>
							{errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
						</div>
						<div className="flex justify-end mt-8">
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Updating..." : "Update Profile"}
							</Button>
						</div>
						{showSuccess && (
							<div className="flex justify-center mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded w-full">
								Profile updated successfully!
							</div>
						)}
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
