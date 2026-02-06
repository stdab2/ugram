import { Settings } from "@/components/settings";

export function SettingsPage() {
	return (
		<div className="bg-muted flex min-h-svh flex-col items-center justify-start p-6 md:p-10">
			<div className="w-full max-w-sm md:max-w-4xl">
				<Settings />
			</div>
		</div>
	);
}
