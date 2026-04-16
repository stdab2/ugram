import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldSeparator } from "@/components/ui/Field";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
} from "@/components/ui/AlertDialog";
import { useState } from "react";

interface AccountDeletionDialogProps {
	onConfirmDelete: (password?: string) => Promise<void>;
	isDeleting?: boolean;
}

export function AccountDeletionDialog({
	onConfirmDelete,
	isDeleting = false,
}: AccountDeletionDialogProps) {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletePassword, setDeletePassword] = useState("");

	const handleDeleteAccount = async () => {
		await onConfirmDelete(deletePassword || undefined);
		setDeleteDialogOpen(false);
		setDeletePassword("");
	};

	const handleOpenChange = (open: boolean) => {
		setDeleteDialogOpen(open);
		if (!open) {
			setDeletePassword("");
		}
	};

	return (
		<>
			<FieldSeparator className="mt-6" />
			<div className="mt-4">
				<h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
				<p className="text-sm text-muted-foreground mt-1 mb-3">
					Permanently delete your account and all associated data. This action cannot be undone.
				</p>
				<AlertDialog open={deleteDialogOpen} onOpenChange={handleOpenChange}>
					<Button
						type="button"
						variant="outline"
						className="border-red-500 text-red-600 hover:bg-red-50"
						onClick={() => setDeleteDialogOpen(true)}
					>
						Delete Account
					</Button>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete your account?</AlertDialogTitle>
							<AlertDialogDescription>
								This will permanently delete your account and all your posts. This action cannot be
								undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<div className="space-y-2 py-2">
							<Label htmlFor="delete-password">
								Confirm your password
								<span className="text-muted-foreground font-normal">
									{" "}
									(leave blank if you signed in with Google)
								</span>
							</Label>
							<Input
								id="delete-password"
								type="password"
								placeholder="Your current password"
								value={deletePassword}
								onChange={(e) => setDeletePassword(e.target.value)}
								autoComplete="current-password"
							/>
						</div>
						<AlertDialogFooter>
							<AlertDialogCancel
								onClick={() => {
									setDeleteDialogOpen(false);
									setDeletePassword("");
								}}
							>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleDeleteAccount}
								disabled={isDeleting}
								className="bg-red-600 hover:bg-red-700 text-white"
							>
								{isDeleting ? "Deleting..." : "Delete Account"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</>
	);
}
