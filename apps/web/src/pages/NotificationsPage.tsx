import { useNavigate, Link } from "react-router-dom";
import { Bell, Heart, MessageCircle, ArrowRight, CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/Empty";
import { PageFade } from "@/components/PageFade";
import { cn, getImageUrl } from "@/lib/utils";
import { formatDate } from "@/lib/postUtils";
import {
	useMarkAllNotificationsReadMutation,
	useMarkNotificationReadMutation,
	useNotificationsQuery,
	useUnreadNotificationCountQuery,
} from "@/generated/graphql";
import { PostImage } from "@/components/PostImage";
import { toast } from "sonner";

export function NotificationsPage() {
	const navigate = useNavigate();
	const { data, loading, error, refetch } = useNotificationsQuery({
		variables: { limit: 30, offset: 0 },
	});
	const { data: unreadCountData } = useUnreadNotificationCountQuery();
	const [markNotificationRead] = useMarkNotificationReadMutation();
	const [markAllNotificationsRead, { loading: isMarkingAllRead }] =
		useMarkAllNotificationsReadMutation();

	const notifications = data?.notifications ?? [];
	const unreadCount = unreadCountData?.unreadNotificationCount ?? 0;

	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);

	const yesterdayStart = new Date(todayStart);
	yesterdayStart.setDate(yesterdayStart.getDate() - 1);

	const last30DaysStart = new Date(todayStart);
	last30DaysStart.setDate(last30DaysStart.getDate() - 30);

	const sections = {
		today: [] as typeof notifications,
		yesterday: [] as typeof notifications,
		last30Days: [] as typeof notifications,
		older: [] as typeof notifications,
	};

	for (const notification of notifications) {
		const notificationDate = new Date(notification.createdAt as string);

		if (notificationDate >= todayStart) {
			sections.today.push(notification);
			continue;
		}

		if (notificationDate >= yesterdayStart) {
			sections.yesterday.push(notification);
			continue;
		}

		if (notificationDate >= last30DaysStart) {
			sections.last30Days.push(notification);
			continue;
		}

		sections.older.push(notification);
	}

	const visibleSections = [
		{ title: "Today", key: "today", items: sections.today },
		{ title: "Yesterday", key: "yesterday", items: sections.yesterday },
		{ title: "Last 30 days", key: "last30Days", items: sections.last30Days },
		{ title: "Older", key: "older", items: sections.older },
	].filter((section) => section.items.length > 0);

	const handleOpenNotification = async (
		notificationId: number,
		postId: number,
		isUnread: boolean
	) => {
		if (isUnread) {
			try {
				await markNotificationRead({
					variables: { id: notificationId },
					refetchQueries: ["Notifications", "UnreadNotificationCount"],
					awaitRefetchQueries: true,
				});
			} catch (error) {
				console.error("Failed to mark notification as read:", error);
				toast.error("Failed to mark notification as read");
			}
		}

		navigate(`/post/${postId}`);
	};

	const handleMarkAllAsRead = async () => {
		try {
			const result = await markAllNotificationsRead({
				refetchQueries: ["Notifications", "UnreadNotificationCount"],
				awaitRefetchQueries: true,
			});

			if (result.errors && result.errors.length > 0) {
				toast.error("Failed to mark all notifications as read");
				return;
			}

			toast.success("All notifications marked as read.");
		} catch (error) {
			console.error("Error marking all notifications as read:", error);
			toast.error("Failed to mark all notifications as read");
		}
	};

	const getNotificationLabel = (type: string) => {
		if (type === "LIKE") return "liked your post";
		if (type === "COMMENT") return "commented on your post";
		return "interacted with your post";
	};

	const getNotificationIcon = (type: string) => {
		if (type === "LIKE") {
			return (
				<div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-500">
					<Heart className="h-5 w-5 fill-current" />
				</div>
			);
		}

		return (
			<div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10 text-sky-500">
				<MessageCircle className="h-5 w-5" />
			</div>
		);
	};

	if (loading && !data) {
		return (
			<PageFade>
				<div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 px-4 py-8 md:px-8">
					<div className="mx-auto max-w-4xl space-y-4">
						<div className="h-24 rounded-2xl bg-muted/60 animate-pulse" />
						<div className="h-24 rounded-2xl bg-muted/60 animate-pulse" />
						<div className="h-24 rounded-2xl bg-muted/60 animate-pulse" />
					</div>
				</div>
			</PageFade>
		);
	}

	if (error) {
		return (
			<PageFade>
				<div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 px-4 py-8 md:px-8 flex items-center justify-center">
					<Empty>
						<EmptyHeader>
							<Bell className="h-12 w-12 text-muted-foreground" />
							<EmptyTitle>Notifications unavailable</EmptyTitle>
							<EmptyDescription>{error.message}</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button onClick={() => refetch()}>Try again</Button>
						</EmptyContent>
					</Empty>
				</div>
			</PageFade>
		);
	}

	if (notifications.length === 0) {
		return (
			<PageFade>
				<div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 px-4 py-8 md:px-8 flex items-center justify-center">
					<Empty>
						<EmptyHeader>
							<Bell className="h-12 w-12 text-muted-foreground" />
							<EmptyTitle>No notifications yet</EmptyTitle>
							<EmptyDescription>
								When someone likes or comments on one of your posts, it will appear here.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button variant="outline" onClick={() => navigate("/")}>
								Back to feed
							</Button>
						</EmptyContent>
					</Empty>
				</div>
			</PageFade>
		);
	}

	return (
		<PageFade>
			<div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 px-4 py-8 md:px-8">
				<div className="mx-auto max-w-4xl">
					<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
								Activity
							</p>
							<h1 className="mt-2 text-3xl font-bold tracking-tight">Notifications</h1>
							<p className="mt-2 text-muted-foreground">
								Likes and comments on your posts appear here.
							</p>
						</div>
						<div className="flex items-center gap-3">
							{unreadCount > 0 && (
								<Badge variant="destructive" className="h-8 px-3 text-sm">
									{unreadCount} unread
								</Badge>
							)}
							<Button
								variant="outline"
								onClick={handleMarkAllAsRead}
								disabled={unreadCount === 0 || isMarkingAllRead}
							>
								<CheckCheck className="mr-2 h-4 w-4" />
								Mark all as read
							</Button>
						</div>
					</div>

					<div className="space-y-8">
						{visibleSections.map((section) => (
							<section key={section.key}>
								<div className="mb-3 flex items-center gap-3">
									<h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
										{section.title}
									</h2>
									<div className="h-px flex-1 bg-border/70" />
								</div>

								<div className="space-y-3">
									{section.items.map((notification) => {
										const isUnread = !notification.readAt;

										return (
											<Link
												key={notification.id}
												to={`/post/${notification.post.id}`}
												onClick={async (event) => {
													event.preventDefault();
													await handleOpenNotification(
														notification.id,
														notification.post.id,
														isUnread
													);
												}}
												className="block"
											>
												<Card
													className={cn(
														"transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
														isUnread && "border-primary/30 bg-primary/5"
													)}
												>
													<div className="flex items-center gap-4 px-4">
														{getNotificationIcon(notification.type)}
														<Avatar className="h-11 w-11 flex-shrink-0">
															<AvatarImage src={getImageUrl(notification.actor.picture)} />
															<AvatarFallback>
																{notification.actor.firstName[0] + notification.actor.lastName[0]}
															</AvatarFallback>
														</Avatar>
														<div className="min-w-0 flex-1">
															<div className="flex flex-wrap items-center gap-2">
																<p className="truncate font-semibold">
																	{notification.actor.userName}
																</p>
																<span className="text-muted-foreground">
																	{getNotificationLabel(notification.type)}
																</span>
																{isUnread && <Badge variant="secondary">New</Badge>}
															</div>
															<p className="mt-1 truncate text-sm text-muted-foreground">
																{notification.post.description}
															</p>
															<p className="mt-1 text-xs text-muted-foreground">
																{formatDate(notification.createdAt)}
															</p>
														</div>
														<div className="flex items-center gap-3">
															<div className="h-16 w-16 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
																<PostImage
																	imageUrl={notification.post.thumbnailUrl}
																	imageStatus={notification.post.imageStatus}
																	alt="Related post"
																	compact
																/>
															</div>
															<ArrowRight className="h-4 w-4 text-muted-foreground" />
														</div>
													</div>
												</Card>
											</Link>
										);
									})}
								</div>
							</section>
						))}
					</div>
				</div>
			</div>
		</PageFade>
	);
}
