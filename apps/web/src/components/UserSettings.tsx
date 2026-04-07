import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { UserDetails } from "@/components/UserDetails";
import { FieldSeparator } from "@/components/ui/Field";
import { useUserQuery, useUpdateUserMutation, useDeleteUserMutation } from "@/generated/graphql";
import { useState, useEffect } from "react";
import { type UserSettingsFormData } from "@/lib/schemas";
import { getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/AuthContext";
import { UserSettingsForm } from "@/components/UserSettingsForm";
import { AccountDeletionDialog } from "@/components/AccountDeletionDialog";

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
	const [errors, setErrors] = useState<Partial<Record<keyof UserSettingsFormData, string>>>({});
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		if (data?.user) {
			setFirstName(data.user.firstName);
			setLastName(data.user.lastName);
			setEmail(data.user.email);
			setPhoneNumber(data.user.phoneNumber ?? "");
		}
	}, [data]);

	const handleProfileSubmit = async (validatedData: UserSettingsFormData) => {
		setErrors({});
		setIsSubmitting(true);

		try {
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
		} catch {
			// Apollo mutation errors are already handled by errorLink
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteAccount = async (password?: string) => {
		setIsDeleting(true);
		try {
			await deleteUser({ variables: { password } });
			toast.success("Account deleted successfully.");
			logout();
		} catch {
			// Apollo mutation errors are already handled by errorLink
		} finally {
			setIsDeleting(false);
		}
	};

	if (loading) return <p>Loading...</p>;

	if (error) return <p>{error.message}</p>;

	const user = data?.user;

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="overflow-hidden pt-2 pb-4 pl-4 pr-4">
				<CardContent className="p-0">
					<h1 className="text-2xl font-bold mb-2">Settings</h1>
					<FieldSeparator />
					<UserDetails
						className="mt-2"
						pictureUrl={getImageUrl(user?.picture) ?? ""}
						avatarFallback={`${user?.firstName[0] ?? ""}${user?.lastName[0] ?? ""}`}
						username={user?.userName ?? ""}
						fullname={`${user?.firstName} ${user?.lastName}`}
						memberSince={user?.createdAt ?? ""}
					/>
					<UserSettingsForm
						firstName={firstName}
						lastName={lastName}
						email={email}
						phoneNumber={phoneNumber}
						onFirstNameChange={setFirstName}
						onLastNameChange={setLastName}
						onEmailChange={setEmail}
						onPhoneNumberChange={setPhoneNumber}
						onSubmit={handleProfileSubmit}
						isSubmitting={isSubmitting}
						errors={errors}
					/>
					<AccountDeletionDialog onConfirmDelete={handleDeleteAccount} isDeleting={isDeleting} />
				</CardContent>
			</Card>
		</div>
	);
}
