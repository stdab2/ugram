"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
	CircleCheckIcon,
	InfoIcon,
	TriangleAlertIcon,
	OctagonXIcon,
	Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			position="top-right"
			expand
			richColors
			icons={{
				success: <CircleCheckIcon className="size-5" />,
				info: <InfoIcon className="size-5" />,
				warning: <TriangleAlertIcon className="size-5" />,
				error: <OctagonXIcon className="size-5" />,
				loading: <Loader2Icon className="size-5 animate-spin" />,
			}}
			toastOptions={{
				unstyled: false,
				classNames: {
					toast: "border-2 rounded-xl px-5 py-4 shadow-xl min-w-[320px]",
					title: "font-semibold text-base",
					description: "text-sm opacity-90 mt-1",
					actionButton:
						"bg-white dark:bg-zinc-800 text-foreground px-4 py-2 rounded-lg font-semibold text-sm border-2 border-current hover:scale-105 transition-transform",
					cancelButton:
						"bg-muted px-4 py-2 rounded-lg font-medium text-sm hover:bg-muted/80 transition-colors",
					closeButton: "bg-white dark:bg-zinc-900 hover:bg-secondary transition-colors rounded-md",
					error: "bg-red-50 dark:bg-red-950 border-red-500 text-red-900 dark:text-red-100",
					success:
						"bg-green-50 dark:bg-green-950 border-green-500 text-green-900 dark:text-green-100",
					warning:
						"bg-amber-50 dark:bg-amber-950 border-amber-500 text-amber-900 dark:text-amber-100",
					info: "bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-900 dark:text-blue-100",
					loading:
						"bg-slate-50 dark:bg-slate-900 border-slate-400 text-slate-900 dark:text-slate-100",
				},
			}}
			duration={5000}
			{...props}
		/>
	);
};

export { Toaster };
