import { z } from "zod";

export const signupSchema = z
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

export type SignupFormData = z.infer<typeof signupSchema>;
