import { z } from "zod";

export const settingsSchema = z.object({
	firstName: z
		.string()
		.nonempty("First name is required")
		.max(20, "First name must be 20 characters or less"),
	lastName: z
		.string()
		.nonempty("Last name is required")
		.max(20, "Last name must be 20 characters or less"),
	email: z.string().nonempty("Email is required").email("Invalid email format"),
	phoneNumber: z
		.string()
		.nonempty("Phone number is required")
		.refine(
			// e.g. +12223334444
			(value) => !value || /^\+?[1-9][0-9]{7,14}$/.test(value),
			"Invalid phone number format"
		),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
