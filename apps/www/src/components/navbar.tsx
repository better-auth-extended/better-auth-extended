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
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "./ui/navigation-menu";
import { usePathname } from "next/navigation";
import { Button, buttonVariants } from "./ui/button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { SearchIcon } from "lucide-react";
import { useSearchContext } from "fumadocs-ui/provider";
import { MetaOrControl } from "./keyboard-shortcuts";
import { cn } from "@/lib/utils";
import { NavbarMobile, NavbarMobileBtn, useNavbarMobile } from "./nav-mobile";
import { useRef } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { owner, repo } from "@/lib/github";

const navigationLinks: NavigationLink[] = [
	{
		href: "/",
		label: "Home",
		matcher: (href, pathname) => href === pathname,
	},
	{
		href: "/docs",
		label: "Documentation",
	},
	{
		href: "/marketplace",
		label: "Marketplace",
	},
];

type NavigationLink = {
	href: string;
	label: string;
	matcher?: (href: string, pathname: string) => boolean;
};

export const Navbar = () => {
	const pathname = usePathname();
	const isDocs = pathname.startsWith("/docs");
	const { resolvedTheme } = useTheme();
	const { scrollY } = useScroll();
	const mounted = useMounted();
	// 0 - 100px
	const backgroundOpacity = useTransform(scrollY, [0, 100], [0, 0.75]);
	const backgroundColor = useMotionTemplate`rgba(${resolvedTheme === "dark" ? "10, 10, 10" : "245, 245, 245"}, ${backgroundOpacity})`;
	const { isOpen, toggleNavbar } = useNavbarMobile();
	const containerRef = useRef<HTMLDivElement>(null);

	useClickOutside(containerRef, () => {
		if (isOpen) {
			toggleNavbar(false);
		}
	});

	return (
		<div ref={containerRef} className="flex flex-col sticky top-0 z-30">
			<motion.nav
				style={mounted ? { backgroundColor } : undefined}
				className={cn(
					"h-(--fd-nav-height) z-40 not-supports-[backdrop-filter:blur(4px)]:bg-background/95 sticky top-0 backdrop-blur-lg inset-x-0 py-3 pr-3 md:pr-6 flex items-center justify-between border-b",
					isOpen && "max-md:bg-background/75!",
				)}
			>
				<div className="flex items-center gap-2.5">
					<div className="flex items-center">
						<a
							href="/"
							className={cn(
								"pl-4 flex md:w-[268px] lg:w-[286px] md:border-r h-(--fd-nav-height) items-center gap-2.5 tracking-tight font-medium",
								isDocs && "md:bg-surface md:border-b",
							)}
						>
							<Logo className="h-6" />
							better-auth-extended
						</a>
					</div>
					<NavigationMenu className="max-md:hidden">
						<NavigationMenuList className="gap-2">
							{navigationLinks.map((link, index) => (
								<NavigationMenuItem key={index}>
									<NavigationMenuLink
										active={
											(!link.matcher
												? pathname.startsWith(link.href)
												: link.matcher(link.href, pathname)) ?? false
										}
										href={link.href}
										className="text-muted-foreground dark:hover:bg-accent/30 dark:data-[active]:bg-accent/50 hover:text-primary py-1.5 font-medium"
									>
										{link.label}
									</NavigationMenuLink>
								</NavigationMenuItem>
							))}
						</NavigationMenuList>
					</NavigationMenu>
				</div>

				<div className="flex items-center gap-1.5 md:gap-2.5">
					<SearchTrigger isDocs={isDocs} />
					<Link
						href={`https://github.com/${owner}/${repo}`}
						className={buttonVariants({
							variant: "outline",
							size: "icon",
							className: "max-md:hidden",
						})}
						rel="noreferrer noopener"
						target="_blank"
					>
						<GitHubLogoIcon />
						<span className="sr-only">better-auth-extended repository</span>
					</Link>
					<ThemeToggle />
					<NavbarMobileBtn />
				</div>
			</motion.nav>
			<NavbarMobile />
		</div>
	);
};
Navbar.displayName = "Navbar";

const SearchTrigger = ({ isDocs }: { isDocs: boolean }) => {
	const { setOpenSearch } = useSearchContext();
	const mounted = useMounted();

	return (
		<>
			<Button
				variant="outline"
				size="icon"
				onClick={() => setOpenSearch(true)}
				className={isDocs ? "md:hidden" : "lg:hidden"}
			>
				<SearchIcon />
				<span className="sr-only">Search...</span>
			</Button>
			{!isDocs ? (
				<div
					role="searchbox"
					className="max-lg:hidden cursor-text h-9 rounded-md bg-accent/50 hover:bg-accent focus-visible:bg-accent dark:bg-accent/30 dark:hover:bg-accent/50 dark:focus-visible:bg-accent/50 border border-border flex items-center gap-2 px-2.5 text-sm text-muted-foreground w-[200px] transition-colors"
					onClick={() => setOpenSearch(true)}
				>
					<SearchIcon className="size-4" />
					<span>Search...</span>
					<div className="ml-auto text-muted-foreground pointer-events-none flex items-center justify-center">
						{mounted && (
							<kbd className="text-muted-foreground/70 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
								<MetaOrControl /> K
							</kbd>
						)}
					</div>
				</div>
			) : null}
		</>
	);
};
SearchTrigger.displayName = "SearchTrigger";
