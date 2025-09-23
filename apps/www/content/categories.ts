import { LibraryIcon, PlugIcon } from "lucide-react";

export const categories = {
	plugins: {
		name: "Plugin",
		icon: PlugIcon,
	},
	libraries: {
		name: "Library",
		icon: LibraryIcon,
	},
} satisfies Record<string, Category>;

export type Category = {
	name: string;
	icon?: React.ComponentType<{ className?: string }>;
	isNew?: boolean;
};
export type Categories = keyof typeof categories;
