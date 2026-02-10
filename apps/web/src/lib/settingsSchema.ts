import { z } from "zod";

export const settingsSchema = z.object({
	firstName: z.string()
	.min(1, "First name is required")
	.max(20, "First name must be 20 characters or less"),
	lastName: z.string()
	.min(1, "Last name is required")
	.max(20, "Last name must be 20 characters or less"),
	email: z.string()
	.min(1, "Email is required")
	.email("Invalid email format"),
	phoneNumber: z.string()
	.refine(
		(value) => !value || /^\+?[1-9][0-9]{7,14}$/.test(value),
		"Invalid phone number format"
	),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
