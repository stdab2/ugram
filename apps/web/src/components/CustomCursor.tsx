import { useEffect, useState } from "react";

type CursorState = "default" | "text" | "link" | "input";

export function CustomCursor() {
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [cursorState, setCursorState] = useState<CursorState>("default");
	const [isVisible, setIsVisible] = useState(false);
	const [isPressed, setIsPressed] = useState(false);

	useEffect(() => {
		let animationFrame: number;

		const updateCursor = (e: MouseEvent) => {
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
			}
			animationFrame = requestAnimationFrame(() => {
				setPosition({ x: e.clientX, y: e.clientY });
				setIsVisible(true);
			});
		};

		const handleMouseDown = () => {
			setIsPressed(true);
		};

		const handleMouseUp = () => {
			setIsPressed(false);
		};

		const handleMouseEnter = (e: MouseEvent) => {
			const target = e.target as HTMLElement;

			// Detect link/button hover first (higher priority)
			if (
				target.matches("a, button, [role='button']") ||
				target.closest("a, button, [role='button']")
			) {
				setCursorState("link");
			}
			// Detect input fields (forms)
			else if (
				target.matches(
					"input[type='text'], input[type='search'], input[type='email'], input[type='password'], input[type='number'], input[type='tel'], input[type='url'], textarea"
				)
			) {
				setCursorState("input");
			}
			// Detect text hover (p, span, h1-h6)
			else if (
				target.matches("p, span, h1, h2, h3, h4, h5, h6, label") ||
				target.closest("p, span, h1, h2, h3, h4, h5, h6, label")
			) {
				setCursorState("text");
			} else {
				setCursorState("default");
			}
		};

		const handleMouseLeave = () => {
			setIsVisible(false);
		};

		document.addEventListener("mousemove", updateCursor);
		document.addEventListener("mouseover", handleMouseEnter);
		document.addEventListener("mouseleave", handleMouseLeave);
		document.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", updateCursor);
			document.removeEventListener("mouseover", handleMouseEnter);
			document.removeEventListener("mouseleave", handleMouseLeave);
			document.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("mouseup", handleMouseUp);
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
			}
		};
	}, [cursorState]);

	return (
		<>
			{/* Main cursor with smooth transitions */}
			<div
				className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-300 ease-out ${
					isVisible ? "opacity-100" : "opacity-0"
				}`}
				style={{
					transform: `translate(${position.x}px, ${position.y}px)`,
					mixBlendMode: cursorState === "link" ? "normal" : "difference",
				}}
			>
				{/* Animated cursor shape with press effect */}
				<div
					className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-out
						${
							cursorState === "default"
								? `w-4 h-4 rounded-full ${isPressed ? "scale-75" : "scale-100"} opacity-100 bg-white`
								: cursorState === "text"
									? `w-1 h-6 rounded-full ${isPressed ? "scale-90" : "scale-100"} opacity-100 bg-white`
									: cursorState === "input"
										? `w-1 h-6 rounded-full ${isPressed ? "scale-90" : "scale-100"} opacity-100 bg-white`
										: `w-8 h-8 rounded-full ${isPressed ? "scale-75" : "scale-100"} opacity-100 border border-2 border-white`
						}
					`}
				/>

				{/* Input field indicator with "abc" text */}
				{cursorState === "input" && (
					<div className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-[9px] font-semibold tracking-wide opacity-90 transition-all duration-300">
						abc
					</div>
				)}
			</div>
		</>
	);
}
