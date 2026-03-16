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
		.optional()
		.refine(
			// e.g. +12223334444
			(value) => !value || /^\+?[1-9][0-9]{7,14}$/.test(value),
			"Invalid phone number format"
		),
});

/**
 * Schema for user signup form validation
 */
export const userSignupSchema = z
	.object({
		firstName: z
			.string()
			.nonempty("First name is required")
			.max(20, "First name must be 20 characters or less"),
		lastName: z
			.string()
			.nonempty("Last name is required")
			.max(20, "Last name must be 20 characters or less"),
		userName: z
			.string()
			.nonempty("Username is required")
			.min(3, "Username must be at least 3 characters")
			.max(20, "Username must be 20 characters or less")
			.regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
		email: z.string().nonempty("Email is required").email("Invalid email format"),
		password: z
			.string()
			.nonempty("Password is required")
			.min(8, "Password must be at least 8 characters long"),
		confirmPassword: z.string().nonempty("Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type UserSignupFormData = z.infer<typeof userSignupSchema>;
export type UserSettingsFormData = z.infer<typeof userSettingsSchema>;
