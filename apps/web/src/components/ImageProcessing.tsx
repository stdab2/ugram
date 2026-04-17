import { ImageIcon } from "lucide-react";

interface ImageProcessingProps {
	compact?: boolean;
}

export function ImageProcessing({ compact = false }: ImageProcessingProps) {
	if (compact) {
		return (
			<div className="w-full h-full relative flex items-center justify-center bg-muted">
				<div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/60 to-muted animate-pulse" />
				<div className="relative z-10 flex flex-col items-center gap-1">
					<div className="relative">
						<div className="w-7 h-7 rounded-full bg-muted-foreground/10 flex items-center justify-center">
							<ImageIcon className="w-3.5 h-3.5 text-muted-foreground/50" />
						</div>
						<div className="absolute inset-0 rounded-full border-2 border-transparent border-t-muted-foreground/40 animate-spin" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="w-full h-full relative flex items-center justify-center bg-muted">
				<div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/60 to-muted animate-pulse" />
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" />
				<div className="relative z-10 flex flex-col items-center gap-3">
					<div className="relative">
						<div className="w-14 h-14 rounded-full bg-muted-foreground/10 flex items-center justify-center ring-2 ring-muted-foreground/20">
							<ImageIcon className="w-6 h-6 text-muted-foreground/50" />
						</div>
						<div className="absolute inset-0 rounded-full border-2 border-transparent border-t-muted-foreground/40 animate-spin" />
					</div>
					<div className="flex flex-col items-center gap-1">
						<span className="text-sm font-medium text-muted-foreground">Processing image…</span>
						<span className="text-xs font-medium text-muted-foreground">
							Refresh the page if it doesn't load
						</span>
						<span className="text-xs text-muted-foreground/60">This may take a moment</span>
					</div>
					<div className="flex items-center gap-1.5">
						<span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
						<span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
						<span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
					</div>
				</div>
			</div>
		</>
	);
}
