import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockUserProfile } from "@/lib/mockData";
import { Upload, X } from "lucide-react";

interface PostFormProps {
	initialImage?: string;
	initialDescription?: string;
	onSubmit: (data: { imagePreview: string | null; description: string }) => Promise<void>;
	submitButtonText: string;
	onCancel: () => void;
	allowImageChange?: boolean;
}

export function PostForm({
	initialImage,
	initialDescription = "",
	onSubmit,
	submitButtonText,
	onCancel,
	allowImageChange = true,
}: PostFormProps) {
	const [imagePreview, setImagePreview] = useState<string | null>(initialImage || null);
	const [description, setDescription] = useState(initialDescription);
	const [isSaving, setIsSaving] = useState(false);

	// Extract hashtags from description
	const hashtags = description.match(/#\w+/g) || [];

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSaving(true);

		try {
			await onSubmit({ imagePreview, description });
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Left side - Image upload/preview */}
				<Card className="p-6">
					<Label className="text-base font-semibold mb-4 block">Image</Label>

					{imagePreview ? (
						<div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
							<img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
							{allowImageChange && (
								<button
									type="button"
									onClick={() => setImagePreview(null)}
									className="absolute top-2 right-2 p-2 bg-background/80 hover:bg-background rounded-full"
								>
									<X className="w-4 h-4" />
								</button>
							)}
						</div>
					) : (
						<label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors">
							<Upload className="w-12 h-12 text-muted-foreground mb-2" />
							<span className="text-sm text-muted-foreground">Click to upload image</span>
							<input
								type="file"
								accept="image/*"
								onChange={handleImageUpload}
								className="hidden"
								required={!initialImage}
							/>
						</label>
					)}

					{!allowImageChange && (
						<p className="text-xs text-muted-foreground mt-2">
							Image cannot be changed when editing
						</p>
					)}
				</Card>

				{/* Right side - Form details */}
				<Card className="p-6">
					<div className="space-y-6">
						{/* User info */}
						<div className="flex items-center gap-3 pb-4 border-b">
							<Avatar className="h-10 w-10">
								<AvatarImage src={mockUserProfile.avatarUrl} />
								<AvatarFallback>{mockUserProfile.avatarFallback}</AvatarFallback>
							</Avatar>
							<div>
								<p className="font-semibold text-sm">{mockUserProfile.username}</p>
								<p className="text-xs text-muted-foreground">
									{mockUserProfile.firstName} {mockUserProfile.lastName}
								</p>
							</div>
						</div>

						{/* Description */}
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								placeholder="Write a caption... Use # to add hashtags"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="min-h-[200px] resize-none"
								required
							/>
							<p className="text-xs text-muted-foreground">{description.length} characters</p>
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
								disabled={isSaving || !imagePreview || !description.trim()}
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
