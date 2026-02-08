import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useEffect } from "react";
import { PostForm } from "@/components/PostForm";
import { mockPosts } from "@/lib/mockData";

export function EditPostPage() {
	const { id } = useParams();
	const navigate = useNavigate();

	// Find post without causing cascading renders
	const post = useMemo(() => {
		if (!id) return null;
		return mockPosts.find((p) => p.id === id) || null;
	}, [id]);

	// Redirect if post not found
	useEffect(() => {
		if (id && !post) {
			navigate("/");
		}
	}, [id, post, navigate]);

	const handleSubmit = async (data: { imagePreview: string | null; description: string }) => {
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		console.log("Updating post", {
			id,
			description: data.description,
			hashtags: data.description.match(/#\w+/g) || [],
		});

		navigate("/");
	};

	const handleCancel = () => {
		navigate(-1);
	};

	if (!post) {
		return (
			<div className="w-full min-h-screen bg-background pb-20 md:pb-0 flex items-center justify-center">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	return (
		<div className="w-full min-h-screen bg-background pb-20 md:pb-0">
			<div className="max-w-4xl mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Edit post</h1>
					<p className="text-muted-foreground mt-2">Update your post details</p>
				</div>

				<PostForm
					initialImage={post.imageUrl}
					initialDescription={post.description}
					onSubmit={handleSubmit}
					submitButtonText="Save changes"
					onCancel={handleCancel}
					allowImageChange={false}
				/>
			</div>
		</div>
	);
}
