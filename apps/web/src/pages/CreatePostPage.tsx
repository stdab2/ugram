import { useNavigate } from "react-router-dom";
import { PostForm } from "@/components/PostForm";
import { CURRENT_USER_ID } from "@/lib/constants";
import { useCreatePostMutation } from "../generated/graphql";

export function CreatePostPage() {
	const navigate = useNavigate();
	const [createPost] = useCreatePostMutation();

	const handleSubmit = async (data: {
		imagePreview: string | null;
		description: string;
		image: File | null;
		mentionedUsers: number[] | null;
	}) => {
		if (!data.imagePreview) return;

		const hashtags = (data.description.match(/#\w+/g) || []).map((t) =>
			t.replace("#", "").toLowerCase()
		);

		await createPost({
			variables: {
				data: {
					description: data.description,
					image: data.image,
					authorId: CURRENT_USER_ID,
					hashtags,
					mentionedUsers: data.mentionedUsers,
				},
			},
		});
		navigate("/");
	};

	const handleCancel = () => {
		navigate(-1);
	};

	return (
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
	);
}
