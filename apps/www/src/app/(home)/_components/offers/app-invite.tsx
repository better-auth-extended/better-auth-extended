"use client";

import { useBentoGridItem } from "@/components/ui/bento-grid";
import { cn } from "@/lib/utils";
import { UserIcon } from "lucide-react";
import { motion } from "motion/react";

const buttonVariants = {
	hidden: {},
	visible: {
		scale: [1, 0.9, 1],
	},
};
export const AppInviteOffer = () => {
	const { hovering } = useBentoGridItem();

	return (
		<div
			className={cn(
				"w-full h-full p-5 select-none transition-opacity duration-150 ease-in-out overflow-hidden relative",
				!hovering ? "opacity-90" : "",
			)}
		>
			<motion.div
				className={cn(
					"w-full h-[350px] rounded-2xl bg-card border border-border pb-5 absolute inset-0 drop-shadow-lg",
				)}
				animate={
					hovering
						? { y: -175, scale: 0.9 }
						: { y: -30, scale: 0.7, rotateX: 15, skewX: 3 }
				}
			>
				<div className="h-full flex flex-col items-center gap-5 px-5">
					<div className="mt-[30px]" />
					<div className="size-16 text-muted-foreground rounded-full bg-card border grid place-items-center">
						<UserIcon className="size-8" />
					</div>
					<span className="text-center w-full flex justify-center items-center text-base">
						John Doe invited you to join us.
					</span>
					<span className="text-center text-muted-foreground w-full flex justify-center items-center text-sm">
						Cillum ipsum incididunt laborum velit deserunt pariatur cupidatat
						magna.
					</span>
					<div className="mt-auto w-full flex items-center gap-2">
						<motion.div
							variants={buttonVariants}
							animate={hovering ? "visible" : "hidden"}
							transition={{
								ease: "easeOut",
								duration: 0.3,
								delay: 0.2,
							}}
							className="grow text-center border border-fd-border py-1.5 rounded-md text-muted-foreground"
						>
							Reject
						</motion.div>
						<motion.div
							variants={buttonVariants}
							animate={hovering ? "visible" : "hidden"}
							transition={{
								ease: "easeOut",
								duration: 0.3,
								delay: 0.6,
							}}
							className="grow text-center border border-fd-border py-1.5 rounded-md text-muted-foreground"
						>
							Accept
						</motion.div>
					</div>
				</div>
			</motion.div>
		</div>
	);
};
AppInviteOffer.displayName = "AppInviteOffer";
