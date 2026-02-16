import { motion } from "motion/react";
import type { ReactNode } from "react";

interface PageFadeProps {
	children: ReactNode;
	delay?: number;
}

export function PageFade({ children, delay = 0 }: PageFadeProps) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{
				duration: 0.3,
				delay,
				ease: "easeOut",
			}}
		>
			{children}
		</motion.div>
	);
}
