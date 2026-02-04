import { cn } from "@/lib/utils";

interface UserPictureProps {
	src: string;
	size?: "sm" | "md" | "lg";
}

const sizeStyles = {
	sm: "w-12 h-12",
	md: "w-16 h-16",
	lg: "w-24 h-24",
};

export function UserPicture({ src, size = "md" }: UserPictureProps) {
	return (
		<div
			className={cn(
				"overflow-hidden rounded-full flex-shrink-0 border-4 border-white shadow-md",
				sizeStyles[size]
			)}
		>
			<img src={src} alt="User picture" className="w-full h-full object-cover" />
		</div>
	);
}
