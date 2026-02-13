import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function PostSkeleton() {
	return (
		<Card className="w-full max-w-[630px] border-0 border-b rounded-none">
			{/* Header */}
			<div className="flex items-center gap-3 p-3">
				<Skeleton className="h-8 w-8 rounded-full" />
				<div className="flex-1 space-y-2">
					<Skeleton className="h-3 w-32" />
					<Skeleton className="h-2 w-20" />
				</div>
				<Skeleton className="h-6 w-6" />
			</div>

			{/* Image */}
			<Skeleton className="w-full aspect-square" />

			{/* Actions */}
			<div className="flex items-center gap-4 p-3">
				<Skeleton className="h-7 w-7" />
				<Skeleton className="h-6 w-6" />
				<Skeleton className="h-6 w-6" />
			</div>

			{/* Description */}
			<div className="px-3 pb-3 space-y-2">
				<Skeleton className="h-3 w-full" />
				<Skeleton className="h-3 w-3/4" />
			</div>
		</Card>
	);
}

export function PostGridSkeleton({ count = 9 }: { count?: number }) {
	return (
		<div className="grid grid-cols-3 gap-1">
			{Array.from({ length: count }).map((_, i) => (
				<Skeleton key={i} className="w-full aspect-square" />
			))}
		</div>
	);
}
