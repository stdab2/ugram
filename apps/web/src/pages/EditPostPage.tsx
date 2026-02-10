import { useParams, useNavigate } from "react-router-dom";
import { PostForm } from "@/components/PostForm";
import { usePostQuery } from "@/generated/graphql";
import { EditPostSkeleton } from "@/components/EditPostSkeleton";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/Empty";
import { Button } from "@/components/ui/Button";
import { getImageUrl } from "@/lib/utils";
import { CURRENT_USERNAME } from "@/lib/constants";
import { AlertCircle, Lock } from "lucide-react";

export function EditPostPage() {
	const { id } = useParams();
	const navigate = useNavigate();

	// Fetch post data
	const {
		data: postData,
		loading,
		error,
	} = usePostQuery({
		variables: { id: parseInt(id || "0") },
		skip: !id,
	});

	const post = postData?.post;

	const handleSubmit = async (data: { imagePreview: string | null; description: string }) => {
		// TODO: Implement GraphQL mutation to update post
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

	// Handle loading state
	if (loading) {
		return <EditPostSkeleton />;
	}

	// Handle error state
	if (error) {
		return (
			<div className="w-full min-h-screen bg-background pb-20 md:pb-0 flex items-center justify-center p-4">
				<Empty>
					<EmptyHeader>
						<AlertCircle className="h-12 w-12 mb-4 text-muted-foreground" />
						<EmptyTitle>Error Loading Post</EmptyTitle>
						<EmptyDescription>{error.message}</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={() => navigate("/")}>Go back to feed</Button>
					</EmptyContent>
				</Empty>
			</div>
		);
	}

	// Handle post not found
	if (!post) {
		return (
			<div className="w-full min-h-screen bg-background pb-20 md:pb-0 flex items-center justify-center p-4">
				<Empty>
					<EmptyHeader>
						<AlertCircle className="h-12 w-12 mb-4 text-muted-foreground" />
						<EmptyTitle>Post Not Found</EmptyTitle>
						<EmptyDescription>
							The post you&apos;re trying to edit doesn&apos;t exist.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={() => navigate("/")}>Go back to feed</Button>
					</EmptyContent>
				</Empty>
			</div>
		);
	}

	// Check if user owns this post
	if (post.author.userName !== CURRENT_USERNAME) {
		return (
			<div className="w-full min-h-screen bg-background pb-20 md:pb-0 flex items-center justify-center p-4">
				<Empty>
					<EmptyHeader>
						<Lock className="h-12 w-12 mb-4 text-muted-foreground" />
						<EmptyTitle>Access Denied</EmptyTitle>
						<EmptyDescription>You can only edit your own posts</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={() => navigate("/")}>Go back to feed</Button>
					</EmptyContent>
				</Empty>
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
					initialImage={getImageUrl(post.imageUrl)}
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
