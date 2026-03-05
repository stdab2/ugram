import { z } from "zod";

/**
 * Schema for user settings form validation
 */
export const userSettingsSchema = z.object({
	firstName: z
		.string()
		.min(1, "First name is required")
		.max(20, "First name must be 20 characters or less"),
	lastName: z
		.string()
		.min(1, "Last name is required")
		.max(20, "Last name must be 20 characters or less"),
	email: z.string().min(1, "Email is required").email("Invalid email format"),
	phoneNumber: z
		.string()
		.min(1, "Phone number is required")
		.regex(/^\+?[1-9][0-9]{7,14}$/, "Invalid phone number format"),
});

export type UserSettingsFormData = z.infer<typeof userSettingsSchema>;
