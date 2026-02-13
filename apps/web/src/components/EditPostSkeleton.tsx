import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function EditPostSkeleton() {
	return (
		<div className="w-full min-h-screen bg-background pb-20 md:pb-0">
			<div className="max-w-4xl mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-6 space-y-2">
					<Skeleton className="h-9 w-32" />
					<Skeleton className="h-5 w-64" />
				</div>

				{/* Form Card */}
				<Card className="p-6">
					<div className="space-y-6">
						{/* User Info */}
						<div className="flex items-center gap-3">
							<Skeleton className="h-10 w-10 rounded-full" />
							<div className="space-y-2">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-3 w-24" />
							</div>
						</div>

						{/* Image Preview */}
						<Skeleton className="w-full aspect-square rounded-lg" />

						{/* Description Input */}
						<div className="space-y-2">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-32 w-full" />
						</div>

						{/* Buttons */}
						<div className="flex gap-3 justify-end">
							<Skeleton className="h-10 w-24" />
							<Skeleton className="h-10 w-36" />
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
