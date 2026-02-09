import { UserSettings } from "@/components/UserSettings";

export function SettingsPage() {
	return (
		<div className="flex min-h-svh flex-col items-center justify-start p-6 md:p-10">
			<div className="w-full md:max-w-4xl">
				<UserSettings />
			</div>
		</div>
	);
}
