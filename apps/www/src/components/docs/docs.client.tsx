import { cn } from "@/lib/utils";
import { SidebarTrigger } from "fumadocs-core/sidebar";
import { useSidebar } from "fumadocs-ui/provider";
import { ButtonHTMLAttributes } from "react";
import { buttonVariants } from "../ui/button";
import { MenuIcon, XIcon } from "lucide-react";

export const NavbarSidebarTrigger = (
	props: ButtonHTMLAttributes<HTMLButtonElement>,
) => {
	const { open } = useSidebar();

	return (
		<SidebarTrigger
			{...props}
			className={cn(
				buttonVariants({
					variant: "ghost",
					size: "icon",
				}),
				props.className,
			)}
		>
			{open ? <XIcon /> : <MenuIcon />}
		</SidebarTrigger>
	);
};
NavbarSidebarTrigger.displayName = "NavbarSidebarTrigger";
