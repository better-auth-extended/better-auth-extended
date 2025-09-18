"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import {
	motion,
	useMotionTemplate,
	useScroll,
	useTransform,
} from "motion/react";
import { useTheme } from "next-themes";
import { Logo } from "./logo";
import { useMounted } from "@/hooks/use-mounted";

export const Navbar = () => {
	const { resolvedTheme } = useTheme();
	const { scrollY } = useScroll();
	const mounted = useMounted();
	// 0 - 100px
	const backgroundOpacity = useTransform(scrollY, [0, 100], [0, 0.75]);
	const backgroundColor = useMotionTemplate`rgba(${resolvedTheme === "dark" ? "10, 10, 10" : "245, 245, 245"}, ${backgroundOpacity})`;

	return (
		<motion.nav
			style={mounted ? { backgroundColor } : undefined}
			className="h-(--fd-nav-height) z-40 not-supports-[backdrop-filter:blur(4px)]:bg-background/95 sticky top-0 backdrop-blur-lg inset-x-0 py-3 px-6 flex items-center justify-between border-b"
		>
			<div className="flex items-center gap-2.5">
				<Link
					href="/"
					className="flex items-center gap-2.5 tracking-tight font-medium"
				>
					<Logo className="h-5" />
					better-auth-extended
				</Link>

				<Link href={"/docs"}>Docs</Link>
			</div>

			<div className="flex items-center gap-2.5">
				<ThemeToggle />
			</div>
		</motion.nav>
	);
};
Navbar.displayName = "Navbar";
