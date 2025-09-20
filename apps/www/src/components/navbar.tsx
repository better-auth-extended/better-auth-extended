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
import { Separator } from "./ui/separator";
import { buttonVariants } from "./ui/button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { SearchIcon } from "lucide-react";
import { useSearchContext } from "fumadocs-ui/provider";

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
	const { resolvedTheme } = useTheme();
	const { scrollY } = useScroll();
	const mounted = useMounted();
	// 0 - 100px
	const backgroundOpacity = useTransform(scrollY, [0, 100], [0, 0.75]);
	const backgroundColor = useMotionTemplate`rgba(${resolvedTheme === "dark" ? "10, 10, 10" : "245, 245, 245"}, ${backgroundOpacity})`;

	return (
		<motion.nav
			style={mounted ? { backgroundColor } : undefined}
			className="h-(--fd-nav-height) z-40 not-supports-[backdrop-filter:blur(4px)]:bg-background/95 sticky top-0 backdrop-blur-lg inset-x-0 py-3 pr-6 flex items-center justify-between border-b"
		>
			<div className="flex items-center gap-2.5">
				<div className="flex items-center pl-6">
					<Link
						href="/"
						className="flex w-(--fd-sidebar-width) h-(--fd-nav-height) items-center gap-2.5 tracking-tight font-medium"
					>
						<Logo className="h-6" />
						better-auth-extended
					</Link>
					<Separator
						orientation="vertical"
						className="-ml-px h-(--fd-nav-height)! bg-border"
					/>
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

			<div className="flex items-center gap-2.5">
				{!pathname.startsWith("/docs") ? <SearchTrigger /> : null}
				<Link
					href="https://github.com/jslno/better-auth-extended"
					className={buttonVariants({
						variant: "outline",
						size: "icon",
					})}
				>
					<GitHubLogoIcon />
					<span className="sr-only">better-auth-extended repository</span>
				</Link>
				<ThemeToggle />
			</div>
		</motion.nav>
	);
};
Navbar.displayName = "Navbar";

const SearchTrigger = () => {
	const { setOpenSearch } = useSearchContext();

	return (
		<div
			role="searchbox"
			className="cursor-text h-9 rounded-md bg-input/50 hover:bg-input focus-visible:bg-input dark:bg-input/30 dark:hover:bg-input/50 dark:focus-visible:bg-input/50 border border-input flex items-center gap-2 px-2.5 text-sm text-muted-foreground w-[200px] transition-colors"
			onClick={() => setOpenSearch(true)}
		>
			<SearchIcon className="size-4" />
			<span>Search...</span>
			<div className="ml-auto text-muted-foreground pointer-events-none flex items-center justify-center">
				<kbd className="text-muted-foreground/70 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
					⌘K
				</kbd>
			</div>
		</div>
	);
};
SearchTrigger.displayName = "SearchTrigger";
