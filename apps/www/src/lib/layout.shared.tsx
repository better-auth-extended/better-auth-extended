import { Navbar } from "@/components/navbar";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const baseOptions = (): BaseLayoutProps => {
	return {
		nav: {
			component: <Navbar />,
		},
		themeSwitch: {
			enabled: false,
		},
	};
};
