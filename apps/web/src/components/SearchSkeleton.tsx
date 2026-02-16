import { Skeleton } from "@/components/ui/Skeleton";

export function SearchSkeleton() {
	return (
		<div className="max-w-[630px] mx-auto pb-20">
			{/* Search Bar */}
			<div className="sticky top-0 z-10 bg-background border-b">
				<div className="p-4">
					<Skeleton className="h-10 w-full" />
				</div>
				<div className="flex gap-2 px-4 pb-3">
					<Skeleton className="h-8 w-16" />
					<Skeleton className="h-8 w-16" />
					<Skeleton className="h-8 w-16" />
				</div>
			</div>

			{/* Content */}
			<div className="mt-2">
				{/* Users */}
				<div className="mb-6">
					<div className="px-4 py-3">
						<Skeleton className="h-6 w-24" />
					</div>
					<div className="flex flex-col gap-4 px-4">
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="flex items-center gap-3">
								<Skeleton className="h-12 w-12 rounded-full" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-3 w-24" />
								</div>
								<Skeleton className="h-8 w-20" />
							</div>
						))}
					</div>
				</div>

				{/* Posts */}
				<div className="px-4 py-3">
					<Skeleton className="h-6 w-20" />
				</div>
				<div className="grid grid-cols-3 gap-1">
					{Array.from({ length: 9 }).map((_, i) => (
						<Skeleton key={i} className="w-full aspect-square" />
					))}
				</div>
			</div>
		</div>
	);
}
