import { ImageProcessing } from "@/components/ImageProcessing";
import { cn, getImageUrl } from "@/lib/utils";

interface PostImageProps {
	thumbnailUrl: string | null;
	imageStatus?: string | null;
	alt: string;
	compact?: boolean;
	className?: string;
}

export function PostImage({
	thumbnailUrl,
	imageStatus,
	alt,
	compact = false,
	className,
}: PostImageProps) {
	if (imageStatus === "PENDING") {
		return <ImageProcessing compact={compact} />;
	}

	return (
		<img
			src={getImageUrl(thumbnailUrl)}
			alt={alt}
			className={cn("w-full h-full object-cover", className)}
		/>
	);
}
