"use client";
import type { ClassValue } from "clsx";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

import { cn } from "@/lib/utils";

type Props = {
	href: string;
	children: React.ReactNode;
	startWith: string;
	title?: string | null;
	className?: ClassValue;
	activeClassName?: ClassValue;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export const AsideLink = ({
	href,
	children,
	startWith,
	title,
	className,
	activeClassName,
	...props
}: Props) => {
	const segment = useSelectedLayoutSegment();
	const path = href;
	const isActive = path.replace("/docs/", "") === segment;

	return (
		<Link
			href={href}
			className={cn(
				isActive
					? cn("text-foreground bg-accent dark:bg-accent/80", activeClassName)
					: "text-muted-foreground hover:text-foreground hover:bg-accent/80 dark:hover:bg-accent/50",
				"w-full transition-colors flex items-center gap-x-2.5 px-5 py-1",
				className,
			)}
			{...props}
		>
			{children}
		</Link>
	);
};
