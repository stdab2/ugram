import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { z } from "zod";
import { userSettingsSchema, type UserSettingsFormData } from "@/lib/schemas";
import { useState, useEffect } from "react";

interface UserSettingsFormProps {
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	onFirstNameChange: (value: string) => void;
	onLastNameChange: (value: string) => void;
	onEmailChange: (value: string) => void;
	onPhoneNumberChange: (value: string) => void;
	onSubmit: (data: UserSettingsFormData) => Promise<void>;
	isSubmitting?: boolean;
	errors?: Partial<Record<keyof UserSettingsFormData, string>>;
}

export function UserSettingsForm({
	firstName,
	lastName,
	email,
	phoneNumber,
	onFirstNameChange,
	onLastNameChange,
	onEmailChange,
	onPhoneNumberChange,
	onSubmit,
	isSubmitting = false,
	errors = {},
}: UserSettingsFormProps) {
	const [isAddingPhone, setIsAddingPhone] = useState(!!phoneNumber);
	const [localErrors, setLocalErrors] = useState<
		Partial<Record<keyof UserSettingsFormData, string>>
	>({});

	useEffect(() => {
		setLocalErrors(errors);
	}, [errors]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLocalErrors({});

		try {
			const validatedData = userSettingsSchema.parse({
				firstName,
				lastName,
				email,
				phoneNumber,
			});

			await onSubmit(validatedData);
		} catch (err) {
			if (err instanceof z.ZodError) {
				const fieldErrors: Partial<Record<keyof UserSettingsFormData, string>> = {};

				err.issues.forEach((error) => {
					const fieldName = error.path[0] as keyof UserSettingsFormData;
					if (fieldName) {
						fieldErrors[fieldName] = error.message;
					}
				});

				setLocalErrors(fieldErrors);
			}
		}
	};

	return (
		<form className="mt-6 space-y-4" onSubmit={handleSubmit}>
			<div className="space-y-2">
				<Label htmlFor="firstname">First Name</Label>
				<Input
					id="firstname"
					type="text"
					autoComplete="given-name"
					value={firstName}
					onChange={(e) => onFirstNameChange(e.target.value)}
					maxLength={20}
					className={localErrors.firstName ? "border-red-500" : ""}
				/>
				{localErrors.firstName && <p className="text-sm text-red-500">{localErrors.firstName}</p>}
				<Label htmlFor="lastname">Last Name</Label>
				<Input
					id="lastname"
					type="text"
					autoComplete="family-name"
					value={lastName}
					onChange={(e) => onLastNameChange(e.target.value)}
					maxLength={20}
					className={localErrors.lastName ? "border-red-500" : ""}
				/>
				{localErrors.lastName && <p className="text-sm text-red-500">{localErrors.lastName}</p>}
			</div>
			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					autoComplete="email"
					value={email}
					onChange={(e) => onEmailChange(e.target.value)}
					className={localErrors.email ? "border-red-500" : ""}
				/>
				{localErrors.email && <p className="text-sm text-red-500">{localErrors.email}</p>}
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
							onChange={(e) => onPhoneNumberChange(e.target.value)}
							className={localErrors.phoneNumber ? "border-red-500" : ""}
						/>
						{localErrors.phoneNumber && (
							<p className="text-sm text-red-500">{localErrors.phoneNumber}</p>
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
	);
}
