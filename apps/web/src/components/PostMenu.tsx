import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Flag } from "lucide-react";

interface PostMenuProps {
	isOwnPost: boolean;
	onEdit?: () => void;
	onDelete?: () => void;
	onReport?: () => void;
}

export function PostMenu({ isOwnPost, onEdit, onDelete, onReport }: PostMenuProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<button
					className="p-2 hover:bg-accent rounded-full transition-colors"
					aria-label="Post options"
				>
					<MoreHorizontal className="h-5 w-5" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-[180px]">
				{isOwnPost ? (
					<>
						<DropdownMenuItem onClick={onEdit}>
							<Pencil className="mr-2 h-4 w-4" />
							Edit post
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={onDelete}
							className="text-destructive focus:text-destructive"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete post
						</DropdownMenuItem>
					</>
				) : (
					<DropdownMenuItem onClick={onReport}>
						<Flag className="mr-2 h-4 w-4" />
						Report
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
