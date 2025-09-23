"use client";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import {
	Fragment,
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { contents, examples } from "../sidebar-content";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { MenuIcon, MenuIconHandle } from "./menu-icon";

interface NavbarMobileContextProps {
	isOpen: boolean;
	toggleNavbar: (value?: boolean) => void;
	isDocsOpen: boolean;
	toggleDocsNavbar: () => void;
}

const NavbarContext = createContext<NavbarMobileContextProps | undefined>(
	undefined,
);

export const NavbarProvider = ({ children }: { children: React.ReactNode }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isDocsOpen, setIsDocsOpen] = useState(false);

	const toggleNavbar = (value?: boolean) => {
		setIsOpen(value ?? ((prevIsOpen) => !prevIsOpen));
	};
	const toggleDocsNavbar = () => {
		setIsDocsOpen((prevIsOpen) => !prevIsOpen);
	};
	return (
		<NavbarContext.Provider
			value={{ isOpen, toggleNavbar, isDocsOpen, toggleDocsNavbar }}
		>
			{children}
		</NavbarContext.Provider>
	);
};

export const useNavbarMobile = (): NavbarMobileContextProps => {
	const context = useContext(NavbarContext);
	if (!context) {
		throw new Error(
			"useNavbarMobile must be used within a NavbarMobileProvider",
		);
	}
	return context;
};

export const NavbarMobileBtn: React.FC = () => {
	const { toggleNavbar, isOpen } = useNavbarMobile();
	const iconRef = useRef<MenuIconHandle>(null);

	useEffect(() => {
		if (isOpen) {
			iconRef.current?.startAnimation();
		} else {
			iconRef.current?.stopAnimation();
		}
	}, [isOpen]);

	return (
		<Button
			size="icon"
			variant="outline"
			className="overflow-hidden md:hidden"
			onClick={() => {
				toggleNavbar();
			}}
		>
			<MenuIcon ref={iconRef} className="scale-125" />
			<span className="sr-only">Toggle menu</span>
		</Button>
	);
};

export const NavbarMobile = () => {
	const { isOpen, toggleNavbar } = useNavbarMobile();
	const pathname = usePathname();
	const isDocs = pathname.startsWith("/docs");

	const [animating, setAnimating] = useState(false);
	useEffect(() => {
		setAnimating(true);
		const id = setTimeout(() => setAnimating((prev) => !prev), 300);
		return () => clearTimeout(id);
	}, [isOpen]);

	return (
		<div
			className={cn(
				"fixed top-(--fd-nav-height) inset-x-0 transform-gpu z-[100] bg-background supports-backdrop-filter:bg-background/75 supports-backdrop-filter:backdrop-blur-lg grid grid-rows-[0fr] duration-300 transition-all md:hidden",
				isOpen && "shadow-lg border-b border-border grid-rows-[1fr]",
			)}
		>
			<div
				className={cn(
					"px-9 min-h-0 max-h-[80vh] divide-y [mask-image:linear-gradient(to_top,transparent,white_40px)] transition-all duration-300",
					isOpen ? "py-5" : "invisible",
					isDocs && "px-4",
					animating ? "overflow-y-hidden" : "overflow-y-auto",
				)}
			>
				{navMenu.map((menu) => (
					<Fragment key={menu.name}>
						{menu.child ? (
							<Accordion type="single" collapsible>
								<AccordionItem value={menu.name}>
									<AccordionTrigger
										className={cn(
											"font-normal text-foreground",
											!isDocs && "text-2xl",
										)}
									>
										{menu.name}
									</AccordionTrigger>
									<AccordionContent className="pl-5 divide-y">
										{menu.child.map((child, j) => (
											<Link
												href={child.path}
												key={child.name}
												className={cn(
													"block py-2 border-b first:pt-0 last:pb-0 last:border-0 text-muted-foreground",
													!isDocs && "text-xl",
												)}
												onClick={() => toggleNavbar()}
											>
												{child.name}
											</Link>
										))}
									</AccordionContent>
								</AccordionItem>
							</Accordion>
						) : (
							<Link
								href={menu.path}
								className={cn(
									"group flex items-center gap-2.5 first:pt-0 last:pb-0 text-2xl py-4",
									isDocs && "text-base py-2",
								)}
								onClick={() => toggleNavbar()}
							>
								{isDocs && (
									<ChevronRight className="ml-0.5 size-4 text-muted-foreground md:hidden" />
								)}
								{menu.name}
							</Link>
						)}
					</Fragment>
				))}
				<DocsNavBarContent />
			</div>
		</div>
	);
};

function DocsNavBarContent() {
	const pathname = usePathname();
	const { toggleNavbar } = useNavbarMobile();
	if (!pathname.startsWith("/docs")) return null;

	const content = pathname.startsWith("/docs/examples") ? examples : contents;

	return (
		<>
			{content.map((menu) => (
				<Accordion type="single" collapsible key={menu.title}>
					<AccordionItem value={menu.title}>
						<AccordionTrigger className="font-normal text-foreground">
							<div className="flex items-center gap-2">
								{!!menu.Icon && <menu.Icon className="w-5 h-5" />}
								{menu.title}
							</div>
						</AccordionTrigger>
						<AccordionContent className="pl-5 divide-y">
							{menu.list.map((child, index) =>
								child.group ? (
									// Group header rendered as div (just a divider)
									<div
										key={child.title}
										className="block py-2 text-sm text-muted-foreground border-none select-none"
									>
										<div className="flex flex-row items-center gap-2">
											<p className="text-sm text-primary">{child.title}</p>
											<div className="flex-grow h-px bg-border" />
										</div>
									</div>
								) : (
									// Regular menu item rendered as Link
									<Link
										href={child.href}
										key={child.title}
										className={cn(
											"block py-2 text-sm text-muted-foreground",
											index === menu.list.length - 1 ||
												menu.list[index + 1]?.group
												? "border-none"
												: "border-b",
										)}
										onClick={() => {
											if (!child.isDisabled) {
												toggleNavbar();
											}
										}}
									>
										<div
											className={cn(
												"flex items-center gap-2",
												child.isDisabled && "opacity-20 line-through",
											)}
										>
											<child.icon />
											{child.title}
										</div>
									</Link>
								),
							)}
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			))}
		</>
	);
}

export const navMenu: {
	name: string;
	path: string;
	child?: {
		name: string;
		path: string;
	}[];
}[] = [
	{
		name: "Home",
		path: "/",
	},
	{
		name: "Documentation",
		path: "/docs",
	},
	{
		name: "Marketplace",
		path: "/marketplace",
	},
];
