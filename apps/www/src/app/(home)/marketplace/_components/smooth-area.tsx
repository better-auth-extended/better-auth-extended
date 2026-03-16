"use client";

import { motion, type Transition } from "motion/react";
import { useEffect, useRef, useState } from "react";

export type SmoothAreaProps = React.HTMLAttributes<HTMLDivElement> & {
	transition?: Transition;
};

export const SmoothArea = ({
	transition = { duration: 0.15 },
	...props
}: SmoothAreaProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState<number | "auto">("auto");

	useEffect(() => {
		if (!containerRef.current) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setHeight(entry.contentRect.height);
			}
		});

		observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, []);

	return (
		<motion.div
			animate={{ height }}
			transition={transition}
			className="overflow-y-clip"
		>
			<div ref={containerRef} {...props} />
		</motion.div>
	);
};
