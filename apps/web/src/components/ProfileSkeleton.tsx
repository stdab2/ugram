import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Separator } from "@/components/ui/Separator";

export function ProfileSkeleton() {
	return (
		<div className="w-full min-h-screen bg-background pb-20 md:pb-0">
			<div className="max-w-5xl mx-auto px-4 py-8">
				{/* Profile Header */}
				<Card className="p-6 md:p-8 mb-8">
					<div className="flex flex-col md:flex-row gap-6 md:gap-8">
						{/* Avatar */}
						<div className="flex justify-center md:justify-start">
							<Skeleton className="h-32 w-32 md:h-40 md:w-40 rounded-full" />
						</div>

						{/* Profile Info */}
						<div className="flex-1 space-y-4">
							<div className="space-y-2">
								<Skeleton className="h-8 w-48" />
								<Skeleton className="h-6 w-32" />
							</div>

							{/* Stats */}
							<div className="flex gap-6">
								<div className="text-center space-y-1">
									<Skeleton className="h-6 w-12 mx-auto" />
									<Skeleton className="h-4 w-12" />
								</div>
								<div className="text-center space-y-1">
									<Skeleton className="h-6 w-12 mx-auto" />
									<Skeleton className="h-4 w-16" />
								</div>
								<div className="text-center space-y-1">
									<Skeleton className="h-6 w-12 mx-auto" />
									<Skeleton className="h-4 w-16" />
								</div>
							</div>

							<Separator />

							{/* Contact Info */}
							<div className="space-y-2">
								<Skeleton className="h-4 w-48" />
								<Skeleton className="h-4 w-40" />
								<Skeleton className="h-4 w-44" />
							</div>
						</div>
					</div>
				</Card>

				{/* Posts Grid Header */}
				<div className="flex items-center justify-between mb-4">
					<Skeleton className="h-7 w-16" />
					<Skeleton className="h-6 w-20" />
				</div>

				{/* Posts Grid */}
				<div className="grid grid-cols-3 gap-1">
					{Array.from({ length: 9 }).map((_, i) => (
						<Skeleton key={i} className="w-full aspect-square" />
					))}
				</div>
			</div>
		</div>
	);
}
