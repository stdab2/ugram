import { Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { PostImage } from "@/components/PostImage";

interface PostPreviewProps {
	thumbnailUrl: string | null;
	imageStatus?: string;
	likes?: number;
	comments?: number;
	className?: string;
	onClick?: () => void;
}

export function PostPreview({
	thumbnailUrl,
	imageStatus,
	likes = 0,
	comments = 0,
	className,
	onClick,
}: PostPreviewProps) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<button
			className={cn(
				"aspect-square overflow-hidden bg-muted relative group w-full transition-all duration-300 hover:shadow-lg",
				className
			)}
			onClick={onClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			aria-label="View post"
		>
			<PostImage
				thumbnailUrl={thumbnailUrl}
				imageStatus={imageStatus}
				alt="Post preview"
				className="transition-transform duration-300 group-hover:scale-105"
			/>
			{isHovered && (
				<div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-6 text-white">
					<div className="flex items-center gap-2">
						<Heart className="w-6 h-6 fill-white" />
						<span className="font-semibold">{likes}</span>
					</div>
					<div className="flex items-center gap-2">
						<MessageCircle className="w-6 h-6 fill-white" />
						<span className="font-semibold">{comments}</span>
					</div>
				</div>
			)}
		</button>
	);
}
