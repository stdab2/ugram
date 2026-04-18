import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Upload, X, Camera } from "lucide-react";
import { getImageUrl, cn, dataURLToFile } from "@/lib/utils";
import { postFormSchema, editPostFormSchema, type PostFormData } from "@/lib/schemas";
import { z } from "zod";
import CameraUIComponent from "./CameraUIComponent";
import { toast } from "sonner";

interface PostFormProps {
	user: {
		userName: string;
		firstName: string;
		lastName: string;
		picture?: string | null;
	};
	initialImage?: string;
	initialDescription?: string;
	onPostEdit?: (description: string) => void;
	onSubmit?: (data: {
		imagePreview: string | null;
		description: string;
		image: File | null;
		mentionedUsernames: string[];
	}) => Promise<void>;
	submitButtonText: string;
	onCancel: () => void;
	allowImageChange?: boolean;
}

export function PostForm({
	user,
	initialImage,
	initialDescription = "",
	onPostEdit,
	onSubmit,
	submitButtonText,
	onCancel,
	allowImageChange = true,
}: PostFormProps) {
	const [imagePreview, setImagePreview] = useState<string | null>(initialImage || null);
	const [description, setDescription] = useState(initialDescription);
	const [image, setImage] = useState<File | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [errors, setErrors] = useState<Partial<Record<keyof PostFormData, string>>>({});
	const [showCameraUi, setShowCameraUi] = useState(false);

	// Extract hashtags and mentions from description
	const hashtags = description.match(/#\w+/g) || [];
	const mentionedUsernames = Array.from(
		new Set((description.match(/@\w+/g) || []).map((u) => u.slice(1)))
	);

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImage(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
			setErrors((prev) => ({ ...prev, image: undefined }));
		}
	};

	const takeAPicture = async () => {
		try {
			if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
				toast.error("Camera is not supported on this browser.");
				return;
			}

			const devices = await navigator.mediaDevices.enumerateDevices();
			const videoInputs = devices.filter((device) => device.kind === "videoinput");

			if (videoInputs.length === 0) {
				toast.error("No camera device accessible.");
				return;
			}

			setShowCameraUi(true);
		} catch (error) {
			toast.error("Unable to access camera devices.");
			console.error(error);
		}
	};

	const handlePictureTaken = (photo: string | ImageData) => {
		if (typeof photo === "string") {
			const file = dataURLToFile(photo, "camera-photo.jpg");
			setImagePreview(photo);
			setImage(file);
			setShowCameraUi(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSaving(true);
		setErrors({});

		try {
			// Validate based on mode (create or edit)
			if (onSubmit) {
				// Create mode - validate with image
				const validatedData = postFormSchema.parse({
					description,
					image,
					imagePreview,
				});

				await onSubmit({
					imagePreview: validatedData.imagePreview || null,
					description: validatedData.description,
					image: validatedData.image || null,
					mentionedUsernames,
				});
			} else if (onPostEdit) {
				// Edit mode - validate description only
				const validatedData = editPostFormSchema.parse({
					description,
				});

				await onPostEdit(validatedData.description);
			}
		} catch (err) {
			if (err instanceof z.ZodError) {
				const fieldErrors: Partial<Record<keyof PostFormData, string>> = {};
				err.issues.forEach((issue) => {
					const fieldName = issue.path[0] as keyof PostFormData;
					if (fieldName) {
						fieldErrors[fieldName] = issue.message;
					}
				});
				setErrors(fieldErrors);
			}
			// Apollo errors handled by errorLink
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Left side - Image upload/preview */}
				<Card className="p-6">
					<div className="flex items-start justify-between">
						<Label className="text-base font-semibold mb-4 block">Image</Label>
						<button
							type="button"
							onClick={takeAPicture}
							className="hidden lg:flex flex-col items-center"
						>
							<div className="flex flex-col items-center">
								<Camera className="w-12 h-12 text-muted-foreground mb-2" />
								<span className="text-sm text-muted-foreground">Take a picture</span>
							</div>
						</button>
					</div>
					{showCameraUi ? (
						<div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
							<CameraUIComponent onCapture={handlePictureTaken} />
							<button
								type="button"
								onClick={() => setShowCameraUi(false)}
								className="absolute top-2 right-2 p-2 bg-background/80 hover:bg-background rounded-full"
								aria-label="Close camera"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					) : imagePreview ? (
						<div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
							<img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
							{allowImageChange && (
								<button
									type="button"
									onClick={() => {
										setImagePreview(null);
										setImage(null);
									}}
									className="absolute top-2 right-2 p-2 bg-background/80 hover:bg-background rounded-full"
									aria-label="Remove image"
								>
									<X className="w-4 h-4" />
								</button>
							)}
						</div>
					) : (
						<label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors">
							<Upload className="w-12 h-12 text-muted-foreground mb-2" />
							<span className="text-sm text-muted-foreground">Click to upload image</span>
							<input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
						</label>
					)}
				</Card>

				{/* Right side - Form details */}
				<Card className="p-6">
					<div className="space-y-6">
						{/* User info */}
						<div className="flex items-center gap-3 pb-4 border-b">
							<Avatar className="h-10 w-10">
								<AvatarImage src={getImageUrl(user.picture)} />
								<AvatarFallback>{user.firstName[0] + user.lastName[0]}</AvatarFallback>
							</Avatar>
							<div>
								<p className="font-semibold text-sm">{user.userName}</p>
								<p className="text-xs text-muted-foreground">
									{user.firstName} {user.lastName}
								</p>
							</div>
						</div>

						{/* Description */}
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								placeholder="Write a caption... Use # to add hashtags and @ to mention users"
								value={description}
								onChange={(e) => {
									setDescription(e.target.value);
									setErrors((prev) => ({ ...prev, description: undefined }));
								}}
								className={cn("min-h-[200px] resize-none", errors.description && "border-red-500")}
							/>
							{errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
							<p className="text-xs text-muted-foreground">
								{description.length} / 2200 characters
							</p>
						</div>

						{/* Hashtags preview */}
						{hashtags.length > 0 && (
							<div className="space-y-2">
								<Label>Hashtags ({hashtags.length})</Label>
								<div className="flex flex-wrap gap-2">
									{hashtags.map((tag, index) => (
										<span
											key={index}
											className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
										>
											{tag}
										</span>
									))}
								</div>
							</div>
						)}

						{/* Mentioned users preview */}
						{mentionedUsernames.length > 0 && (
							<div className="space-y-2">
								<Label>Mentioned users ({mentionedUsernames.length})</Label>
								<div className="flex flex-wrap gap-2">
									{mentionedUsernames.map((username, index) => (
										<span
											key={index}
											className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm rounded-full"
										>
											@{username}
										</span>
									))}
								</div>
							</div>
						)}

						{/* Actions */}
						<div className="flex gap-3 pt-4">
							<Button
								size="lg"
								type="button"
								variant="outline"
								onClick={onCancel}
								disabled={isSaving}
								className="flex-1 p-5"
							>
								Cancel
							</Button>
							<Button
								size="lg"
								type="submit"
								disabled={
									isSaving ||
									!imagePreview ||
									!description.trim() ||
									description.trim() === initialDescription.trim()
								}
								className="flex-1 p-5"
							>
								{isSaving ? "Saving..." : submitButtonText}
							</Button>
						</div>
					</div>
				</Card>
			</div>
		</form>
	);
}
