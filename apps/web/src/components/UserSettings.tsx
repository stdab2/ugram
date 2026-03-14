import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { UserDetails } from "@/components/UserDetails";
import { FieldSeparator } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { useUserQuery, useUpdateUserMutation, useDeleteUserMutation } from "@/generated/graphql";
import { useState, useEffect } from "react";
import { z } from "zod";
import { userSettingsSchema, type UserSettingsFormData } from "@/lib/schemas";
import { getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/AuthContext";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
} from "@/components/ui/AlertDialog";

export function UserSettings({ className, ...props }: React.ComponentProps<"div">) {
	const { logout, userAuth } = useAuth();

	const { data, loading, error } = useUserQuery({
		variables: { id: userAuth!.id },
	});

	const [updateUser] = useUpdateUserMutation();
	const [deleteUser] = useDeleteUserMutation();

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isAddingPhone, setIsAddingPhone] = useState(false);
	const [errors, setErrors] = useState<Partial<Record<keyof UserSettingsFormData, string>>>({});

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletePassword, setDeletePassword] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		if (data?.user) {
			setFirstName(data.user.firstName);
			setLastName(data.user.lastName);
			setEmail(data.user.email);
			setPhoneNumber(data.user.phoneNumber ?? "");

			if (data.user.phoneNumber) {
				setIsAddingPhone(true);
			}
		}
	}, [data]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});
		setIsSubmitting(true);

		try {
			const validatedData = userSettingsSchema.parse({
				firstName,
				lastName,
				email,
				phoneNumber,
			});

			await updateUser({
				variables: {
					id: userAuth!.id,
					firstName: validatedData.firstName,
					lastName: validatedData.lastName,
					email: validatedData.email,
					phoneNumber: validatedData.phoneNumber,
				},
			});

			toast.success("Profile updated successfully!");
		} catch (err) {
			if (err instanceof z.ZodError) {
				const fieldErrors: Partial<Record<keyof UserSettingsFormData, string>> = {};

				err.issues.forEach((error) => {
					const fieldName = error.path[0] as keyof UserSettingsFormData;

					if (fieldName) {
						fieldErrors[fieldName] = error.message;
					}
				});

				setErrors(fieldErrors);
			}
			// Apollo mutation errors are already handled by errorLink
		} finally {
			setIsSubmitting(false);
		}
	};

	if (loading) return <p>Loading...</p>;

	if (error) return <p>{error.message}</p>;

	const user = data?.user;

	const handleDeleteAccount = async () => {
		setIsDeleting(true);
		try {
			await deleteUser({ variables: { password: deletePassword || undefined } });
			toast.success("Account deleted successfully.");
			logout();
		} catch {
			// Apollo mutation errors are already handled by errorLink
		} finally {
			setIsDeleting(false);
			setDeleteDialogOpen(false);
			setDeletePassword("");
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="overflow-hidden pt-2 pb-4 pl-4 pr-4">
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
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className={errors.email ? "border-red-500" : ""}
							/>
							{errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
						</div>
						<div className="space-y-2">
							<Label htmlFor="telephone">Phone Number</Label>
							{!phoneNumber && !isAddingPhone ? (
								<Button
									id="telephone"
									type="button"
									variant="outline"
									onClick={() => setIsAddingPhone(true)}
								>
									Add Phone Number
								</Button>
							) : (
								<>
									<Input
										id="telephone"
										type="tel"
										placeholder="e.g. +12223334444"
										value={phoneNumber}
										onChange={(e) => setPhoneNumber(e.target.value)}
										className={errors.phoneNumber ? "border-red-500" : ""}
									/>
									{errors.phoneNumber && (
										<p className="text-sm text-red-500">{errors.phoneNumber}</p>
									)}
								</>
							)}
						</div>
						<div className="flex justify-end mt-8">
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Updating..." : "Update Profile"}
							</Button>
						</div>
					</form>
					<FieldSeparator className="mt-6" />
					<div className="mt-4">
						<h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
						<p className="text-sm text-muted-foreground mt-1 mb-3">
							Permanently delete your account and all associated data. This action cannot be undone.
						</p>
						<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
							<Button
								type="button"
								variant="outline"
								className="border-red-500 text-red-600 hover:bg-red-50"
								onClick={() => setDeleteDialogOpen(true)}
							>
								Delete Account
							</Button>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Delete your account?</AlertDialogTitle>
									<AlertDialogDescription>
										This will permanently delete your account and all your posts. This action cannot
										be undone.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<div className="space-y-2 py-2">
									<Label htmlFor="delete-password">
										Confirm your password
										<span className="text-muted-foreground font-normal">
											{" "}
											(leave blank if you signed in with Google)
										</span>
									</Label>
									<Input
										id="delete-password"
										type="password"
										placeholder="Your current password"
										value={deletePassword}
										onChange={(e) => setDeletePassword(e.target.value)}
										autoComplete="current-password"
									/>
								</div>
								<AlertDialogFooter>
									<AlertDialogCancel
										onClick={() => {
											setDeleteDialogOpen(false);
											setDeletePassword("");
										}}
									>
										Cancel
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleDeleteAccount}
										disabled={isDeleting}
										className="bg-red-600 hover:bg-red-700 text-white"
									>
										{isDeleting ? "Deleting..." : "Delete Account"}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
