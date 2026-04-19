import { useNavigate } from "react-router-dom";
import { PostForm } from "@/components/PostForm";
import { PageFade } from "@/components/PageFade";
import {
	useCreatePostMutation,
	useUserByUserNameQuery,
	useUsersByUserNamesLazyQuery,
} from "../generated/graphql";
import { toast } from "sonner";
import { useAuth } from "@/AuthContext";
import { trackEvent } from "@/lib/ga";

export function CreatePostPage() {
	const { userAuth } = useAuth();
	const navigate = useNavigate();
	const [createPost] = useCreatePostMutation();
	const [fetchUsersByUserNames] = useUsersByUserNamesLazyQuery();

	// Fetch current user data
	const {
		data: userData,
		loading: userLoading,
		error: userError,
	} = useUserByUserNameQuery({
		variables: { userName: userAuth!.userName },
	});

	const user = userData?.userByUserName;

	const handleSubmit = async (data: {
		imagePreview: string | null;
		description: string;
		image: File | null;
		mentionedUsernames: string[];
	}) => {
		if (!data.imagePreview || !data.image) return;

		const hashtags = (data.description.match(/#\w+/g) || []).map((t) =>
			t.replace("#", "").toLowerCase()
		);

		// Verify mentioned users
		let mentionedUsers: number[] = [];
		if (data.mentionedUsernames.length > 0) {
			try {
				const mentionedUsersVerified = await fetchUsersByUserNames({
					variables: { userNames: data.mentionedUsernames },
				});

				const missingUserNames = mentionedUsersVerified.data?.usersByUserNames?.missingUserNames;
				if (missingUserNames && missingUserNames.length > 0) {
					const errorMessage = `The following mentioned users were not found: ${missingUserNames.join(", ")}`;
					toast.error(errorMessage);
					return;
				}

				mentionedUsers =
					mentionedUsersVerified.data?.usersByUserNames?.users?.map((u) => u.id) || [];
			} catch {
				// Verification error already handled by errorLink
				return;
			}
		}

		try {
			await createPost({
				variables: {
					data: {
						description: data.description,
						image: data.image,
						authorId: userAuth!.id,
						hashtags,
						mentionedUsers,
					},
				},
			});
			trackEvent("create_post", {
				content_type: "image",
				hashtag_count: hashtags.length,
				mentions_count: mentionedUsers.length,
				has_hashtags: hashtags.length > 0,
			});
			toast.success("Your post has been created!");
			navigate("/");
		} catch {
			// Error already handled by errorLink
		}
	};

	const handleCancel = () => {
		navigate(-1);
	};

	// Show loading state while fetching user
	if (userLoading) {
		return (
			<PageFade>
				<div className="w-full min-h-screen bg-background pb-20 md:pb-0">
					<div className="max-w-4xl mx-auto px-4 py-8">
						<div className="mb-6">
							<h1 className="text-3xl font-bold">Create a new post</h1>
							<p className="text-muted-foreground mt-2">Share your moments with the world</p>
						</div>
						<div className="flex items-center justify-center p-12">
							<div className="text-muted-foreground">Loading...</div>
						</div>
					</div>
				</div>
			</PageFade>
		);
	}

	// Show error state if user could not be loaded
	if (userError || !user) {
		return (
			<PageFade>
				<div className="w-full min-h-screen bg-background pb-20 md:pb-0">
					<div className="max-w-4xl mx-auto px-4 py-8">
						<div className="mb-6">
							<h1 className="text-3xl font-bold">Create a new post</h1>
							<p className="text-muted-foreground mt-2">Share your moments with the world</p>
						</div>
						<div className="flex items-center justify-center p-12">
							<div className="text-destructive">
								{userError ? "Failed to load user data." : "User not found."}
							</div>
						</div>
					</div>
				</div>
			</PageFade>
		);
	}

	return (
		<PageFade>
			<div className="w-full min-h-screen bg-background pb-20 md:pb-0">
				<div className="max-w-4xl mx-auto px-4 py-8">
					{/* Header */}
					<div className="mb-6">
						<h1 className="text-3xl font-bold">Create a new post</h1>
						<p className="text-muted-foreground mt-2">Share your moments with the world</p>
					</div>

					<PostForm
						user={{
							userName: user.userName,
							firstName: user.firstName,
							lastName: user.lastName,
							picture: user.picture,
						}}
						onSubmit={handleSubmit}
						submitButtonText="Publish"
						onCancel={handleCancel}
					/>
				</div>
			</div>
		</PageFade>
	);
}
