import { z } from "zod";

/**
 * Schema for post creation/editing form validation
 */
export const postFormSchema = z.object({
	description: z
		.string()
		.min(1, "Description is required")
		.max(2200, "Description must be 2200 characters or less"),
	image: z
		.instanceof(File, { message: "Image is required" })
		.refine((file) => file.size <= 5 * 1024 * 1024, "Image must be less than 5MB")
		.refine(
			(file) => ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type),
			"Only JPEG, PNG, and WebP images are allowed"
		)
		.optional()
		.nullable(),
	imagePreview: z.string().optional().nullable(),
});

export type PostFormData = z.infer<typeof postFormSchema>;

/**
 * Schema for edit post (description only, image not changeable)
 */
export const editPostFormSchema = z.object({
	description: z
		.string()
		.min(1, "Description is required")
		.max(2200, "Description must be 2200 characters or less"),
});

export type EditPostFormData = z.infer<typeof editPostFormSchema>;
