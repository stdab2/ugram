import { Post } from "@/components/post";

const mockPosts = [
	{
		id: "1",
		author: {
			username: "john_doe",
			avatarUrl: "https://i.pravatar.cc/150?img=1",
			avatarFallback: "JD",
		},
		imageUrl: "https://picsum.photos/seed/post1/1080/1080",
		aspectRatio: "square" as const,
		publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
		description: "Beautiful sunset at the beach 🌅 @jane_smith #sunset #beach #photography",
		likes: 1243,
		comments: 42,
		isLiked: true,
	},
	{
		id: "2",
		author: {
			username: "jane_smith",
			avatarUrl: "https://i.pravatar.cc/150?img=5",
			avatarFallback: "JS",
		},
		imageUrl: "https://picsum.photos/seed/post2/1080/1350",
		aspectRatio: "portrait" as const,
		publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
		description: "Morning coffee vibes ☕️ #coffee #morning #lifestyle",
		likes: 892,
		comments: 18,
		isLiked: false,
	},
	{
		id: "3",
		author: {
			username: "travel_explorer",
			avatarUrl: "https://i.pravatar.cc/150?img=8",
			avatarFallback: "TE",
		},
		imageUrl: "https://picsum.photos/seed/post3/1080/566",
		aspectRatio: "landscape" as const,
		publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
		description:
			"Mountain views from the top 🏔️ Amazing hiking experience with @john_doe #travel #mountains #adventure #hiking",
		likes: 2156,
		comments: 87,
		isLiked: false,
	},
	{
		id: "4",
		author: {
			username: "foodie_lover",
			avatarUrl: "https://i.pravatar.cc/150?img=12",
			avatarFallback: "FL",
		},
		imageUrl: "https://picsum.photos/seed/post4/1080/1080",
		aspectRatio: "square" as const,
		publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
		description: "Homemade pasta night 🍝 Recipe in bio! #food #cooking #pasta #italian",
		likes: 634,
		comments: 23,
		isLiked: true,
	},
	{
		id: "5",
		author: {
			username: "urban_photographer",
			avatarUrl: "https://i.pravatar.cc/150?img=15",
			avatarFallback: "UP",
		},
		imageUrl: "https://picsum.photos/seed/post5/1080/1350",
		aspectRatio: "portrait" as const,
		publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
		description: "City lights and night vibes 🌃 #citylife #photography #urban #nightphotography",
		likes: 1789,
		comments: 56,
		isLiked: false,
	},
];

export function FeedPage() {
	return (
		<div className="flex justify-center min-h-screen bg-background">
			<div className="w-full max-w-[630px] pb-20 md:pb-0">
				{mockPosts.map((post) => (
					<Post
						key={post.id}
						author={post.author}
						imageUrl={post.imageUrl}
						aspectRatio={post.aspectRatio}
						publishedAt={post.publishedAt}
						description={post.description}
						likes={post.likes}
						comments={post.comments}
						isLiked={post.isLiked}
						onLike={() => console.log("Like", post.id)}
						onComment={() => console.log("Comment", post.id)}
						onShare={() => console.log("Share", post.id)}
					/>
				))}
			</div>
		</div>
	);
}
