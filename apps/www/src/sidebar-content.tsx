import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { PageTree } from "fumadocs-core/server";
import {
	BookOpenTextIcon,
	DoorOpenIcon,
	FlaskConicalIcon,
	HourglassIcon,
	LucideIcon,
	Settings2Icon,
	UserPlusIcon,
} from "lucide-react";
import { ReactNode, SVGProps } from "react";

interface Content {
	title: string;
	href?: string;
	Icon: ((props?: SVGProps<any>) => ReactNode) | LucideIcon;
	isNew?: boolean;
	list: {
		title: string;
		href: string;
		icon: ((props?: SVGProps<any>) => ReactNode) | LucideIcon;
		group?: boolean;
		isNew?: boolean;
		isDisabled?: boolean;
	}[];
}

export function getPageTree(): PageTree.Root {
	return {
		$id: "root",
		name: "docs",
		children: [
			{
				type: "folder",
				root: true,
				name: "Docs",
				description: "get started, plugins and libraries.",
				children: contents.map(contentToPageTree),
			},
			{
				type: "folder",
				root: true,
				name: "Examples",
				description: "exmaples and guides.",
				children: examples.map(contentToPageTree),
			},
		],
	};
}

function contentToPageTree(content: Content): PageTree.Folder {
	return {
		type: "folder",
		icon: <content.Icon />,
		name: content.title,
		index: content.href
			? {
					icon: <content.Icon />,
					name: content.title,
					type: "page",
					url: content.href,
				}
			: undefined,
		children: content.list.map((item) => ({
			type: "page",
			url: item.href,
			name: item.title,
			icon: <item.icon />,
		})),
	};
}

export const contents: Content[] = [
	{
		title: "Get Started",
		Icon: () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="1.4em"
				height="1.4em"
				viewBox="0 0 24 24"
			>
				<path
					fill="currentColor"
					d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m-1 14H9V8h2zm1 0V8l5 4z"
				/>
			</svg>
		),
		list: [
			{
				title: "Introduction",
				href: "/docs/introduction",
				icon: () => <BookOpenTextIcon className="size-4" />,
			},
		],
	},
	{
		title: "Plugins",
		Icon: () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="1.4em"
				height="1.4em"
				viewBox="0 0 24 24"
			>
				<g fill="none">
					<path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
					<path
						fill="currentColor"
						d="M15 20a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2zm0-18a1 1 0 0 1 .993.883L16 3v3h2a2 2 0 0 1 1.995 1.85L20 8v5a6 6 0 0 1-5.775 5.996L14 19h-4a6 6 0 0 1-5.996-5.775L4 13V8a2 2 0 0 1 1.85-1.995L6 6h2V3a1 1 0 0 1 1.993-.117L10 3v3h4V3a1 1 0 0 1 1-1"
					/>
				</g>
			</svg>
		),
		list: [
			{
				title: "App Invite",
				href: "/docs/plugins/app-invite",
				icon: () => <UserPlusIcon className="size-4" />,
			},
			{
				title: "Onboarding",
				href: "/docs/plugins/onboarding",
				icon: () => <DoorOpenIcon className="size-4" />,
			},
			{
				title: "Preferences",
				href: "/docs/plugins/preferences",
				icon: () => <Settings2Icon className="size-4" />,
				isNew: true,
			},
			{
				title: "Help Desk",
				href: "/docs/plugins/help-desk",
				icon: () => <QuestionMarkCircledIcon className="size-4" />,
				isDisabled: true,
			},
			{
				title: "Waitlist",
				href: "/docs/plugins/waitlist",
				icon: () => <HourglassIcon className="size-4" />,
				isDisabled: true,
			},
		],
	},
	{
		title: "Libraries",
		Icon: () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="1.3em"
				height="1.3em"
				viewBox="0 0 20 20"
			>
				<path
					fill="currentColor"
					d="M0 3v16h5V3zm4 12H1v-1h3zm0-3H1v-1h3zm2-9v16h5V3zm4 12H7v-1h3zm0-3H7v-1h3zm1-8.5l4.1 15.4l4.8-1.3l-4-15.3zm7 10.6l-2.9.8l-.3-1l2.9-.8zm-.8-2.9l-2.9.8l-.2-1l2.9-.8z"
				></path>
			</svg>
		),
		list: [
			{
				title: "Test Utils",
				href: "/docs/libraries/test-utils",
				icon: () => <FlaskConicalIcon className="size-4" />,
			},
		],
	},
];

export const examples: Content[] = [];
