import { useNavigate } from "react-router-dom";
import { PostForm } from "@/components/PostForm";
import { PageFade } from "@/components/PageFade";

export function CreatePostPage() {
	const navigate = useNavigate();

	const handleSubmit = async (data: { imagePreview: string | null; description: string }) => {
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		console.log("Creating post", {
			description: data.description,
			hashtags: data.description.match(/#\w+/g) || [],
			imagePreview: data.imagePreview,
		});

		navigate("/");
	};

	const handleCancel = () => {
		navigate(-1);
	};

	return (
		<PageFade>
			<div className="w-full min-h-screen bg-background pb-20 md:pb-0">
				<div className="max-w-4xl mx-auto px-4 py-8">
					{/* Header */}
					<div className="mb-6">
						<h1 className="text-3xl font-bold">Create a new post</h1>
						<p className="text-muted-foreground mt-2">Share your moments with the world</p>
					</div>

					<PostForm onSubmit={handleSubmit} submitButtonText="Publish" onCancel={handleCancel} />
				</div>
			</div>
		</PageFade>
	);
}
