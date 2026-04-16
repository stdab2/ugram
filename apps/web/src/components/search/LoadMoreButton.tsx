import { Button } from "@/components/ui/Button";

interface LoadMoreButtonProps {
	loading: boolean;
	onClick: () => void;
	label: string;
}

export function LoadMoreButton({ loading, onClick, label }: LoadMoreButtonProps) {
	return (
		<Button
			variant="ghost"
			onClick={onClick}
			disabled={loading}
			className="w-full text-indigo-400 hover:text-indigo-300"
		>
			{loading ? "Loading..." : label}
		</Button>
	);
}
