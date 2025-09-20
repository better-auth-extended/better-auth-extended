"use client";

import { useBentoGridItem } from "@/components/ui/bento-grid";
import { Switch } from "@/components/ui/switch";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useTheme } from "next-themes";

export const PreferencesOffer = () => {
	const { hovering } = useBentoGridItem();
	const { resolvedTheme } = useTheme();
	const mounted = useMounted();

	return (
		<div
			className={cn(
				"w-full h-full p-5 grid pointer-events-none place-items-center select-none transition-opacity duration-150 ease-in-out overflow-hidden relative",
				!hovering ? "opacity-90" : "",
			)}
		>
			<div className="flex flex-col-reverse w-full gap-1">
				<motion.div
					animate={
						hovering
							? {
									rotateZ: -6,
									y: 45,
									opacity: 0,
								}
							: {
									rotateZ: -2,
								}
					}
					className="drop-shadow-lg w-full h-14 px-4 flex items-center rounded-lg bg-card border border-border"
				>
					<span className="text-sm text-muted-foreground">Dark mode</span>

					<Switch
						className="ml-auto"
						checked={mounted ? resolvedTheme === "dark" : undefined}
						onCheckedChange={() => {}}
						defaultChecked={false}
					/>
				</motion.div>
				<motion.div
					animate={
						hovering
							? {
									y: (56 + 32) / 2,
									scale: 1.1,
								}
							: {
									rotateZ: 2,
								}
					}
					className="drop-shadow-lg w-full h-14 px-4 flex items-center rounded-lg bg-card border border-border"
				>
					<span className="text-sm text-muted-foreground group-hover/bento:text-foreground transition-colors">
						Email notifications
					</span>
					<Switch
						className="ml-auto"
						checked={hovering}
						onCheckedChange={() => {}}
					/>
				</motion.div>
			</div>
		</div>
	);
};
PreferencesOffer.displayName = "PreferencesOffer";
