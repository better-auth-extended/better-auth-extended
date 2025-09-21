"use client";

import {
	SearchDialog,
	SearchDialogContent,
	SearchDialogFooter,
	SearchDialogHeader,
	SearchDialogIcon,
	SearchDialogInput,
	SearchDialogOverlay,
	useSearch,
	type SharedProps,
} from "fumadocs-ui/components/dialog/search";
import { useDocsSearch } from "fumadocs-core/search/client";
import { I18nLabel, useI18n } from "fumadocs-ui/contexts/i18n";
import {
	ComponentProps,
	createContext,
	Fragment,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { SortedResult } from "fumadocs-core/server";
import { cn } from "@/lib/utils";
import { HighlightedText } from "fumadocs-core/search/server";
import scrollIntoView from "scroll-into-view-if-needed";
import {
	BookTextIcon,
	BoxesIcon,
	BoxIcon,
	FileTextIcon,
	HashIcon,
	XIcon,
} from "lucide-react";
import { useOnChange } from "fumadocs-core/utils/use-on-change";
import { useEffectEvent } from "fumadocs-core/utils/use-effect-event";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { categories } from "~/categories";
import { badgeVariants } from "./ui/badge";

type ReactSortedResult = Omit<SortedResult, "content"> & {
	external?: boolean;
	content: React.ReactNode;
};

export function CustomSearchDialog(props: SharedProps) {
	const { locale } = useI18n();
	const [tag, setTag] = useState<string[]>([]);
	const { search, setSearch, query } = useDocsSearch({
		type: "fetch",
		locale,
		tag: tag.length >= 1 ? tag : undefined,
	});

	return (
		<SearchDialog
			search={search}
			onSearchChange={setSearch}
			isLoading={query.isLoading}
			{...props}
		>
			<SearchDialogOverlay />
			<SearchDialogContent className="rounded-lg">
				<SearchDialogHeader className="h-12">
					<SearchDialogIcon className="size-4.5" />
					<SearchDialogInput />
					<Button
						size="icon"
						variant="ghost"
						className="size-7 text-muted-foreground hover:text-foreground focus-visible:text-foreground"
						onClick={() => props.onOpenChange(false)}
					>
						<XIcon />
						<span className="sr-only">Close search dialog</span>
					</Button>
				</SearchDialogHeader>
				<SearchDialogList items={query.data !== "empty" ? query.data : null} />
				<SearchDialogFooter className="flex flex-row">
					<div className="flex items-center gap-1 flex-wrap">
						{Object.entries({
							docs: {
								name: "Docs",
								icon: BookTextIcon,
							},
							resources: {
								name: "Resources",
								icon: BoxesIcon,
							},
							...(tag?.includes("resources") ? categories : {}),
						}).map(([id, config]) => (
							<button
								type="button"
								key={id}
								data-active={tag?.includes(id)}
								className={badgeVariants({
									variant: "outline",
									className:
										"outline-0 flex items-center gap-1.5 text-muted-foreground data-[active=true]:bg-accent data-[active=true]:text-foreground rounded-sm dark:data-[active=true]:bg-accent/50 transition-colors",
								})}
								onClick={() => {
									setTag((prev) => {
										const isActive = prev.includes(id);
										const categoryKeys = Object.keys(categories);
										if (isActive) {
											if (id === "resources") {
												return prev.filter(
													(t) => t !== "resources" && !categoryKeys.includes(t),
												);
											}

											if (categoryKeys.includes(id)) {
												return prev.filter((t) => t !== id);
											}
											return prev.filter((t) => t !== id);
										}
										if (id === "docs" || id === "resources") {
											return [id];
										}
										if (categoryKeys.includes(id)) {
											return ["resources", id];
										}
										return prev;
									});
								}}
							>
								{config.icon ? (
									<config.icon className="-ms-0.5 size-3.5" />
								) : null}
								{config.name}
							</button>
						))}
					</div>
				</SearchDialogFooter>
			</SearchDialogContent>
		</SearchDialog>
	);
}

function renderHighlights(highlights: HighlightedText[]): React.ReactNode {
	return highlights.map((node, i) => {
		if (node.styles?.highlight) {
			return (
				<span key={i} className="text-fd-primary bg-fd-primary/10">
					{node.content}
				</span>
			);
		}

		return <Fragment key={i}>{node.content}</Fragment>;
	});
}

const ListContext = createContext<{
	active: string | null;
	setActive: (v: string | null) => void;
} | null>(null);

export function useSearchList() {
	const ctx = useContext(ListContext);
	if (!ctx) throw new Error("Missing <SearchDialogList />");
	return ctx;
}

function SearchDialogList({
	items = null,
	Empty = () => (
		<div className="py-12 text-center text-sm text-fd-muted-foreground">
			<I18nLabel label="searchNoResult" />
		</div>
	),
	...props
}: Omit<ComponentProps<"div">, "children"> & {
	items: ReactSortedResult[] | null | undefined;
	/**
	 * Renderer for empty list UI
	 */
	Empty?: () => React.ReactNode;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [active, setActive] = useState<string | null>(() =>
		items && items.length > 0 ? items[0].id : null,
	);
	const { onOpenChange } = useSearch();
	const router = useRouter();

	const onOpen = ({ external, url }: ReactSortedResult) => {
		if (external) window.open(url, "_blank")?.focus();
		else router.push(url);
		onOpenChange(false);
	};

	const onKey = useEffectEvent((e: KeyboardEvent) => {
		if (!items || e.isComposing) return;

		if (e.key === "ArrowDown" || e.key == "ArrowUp") {
			let idx = items.findIndex((item) => item.id === active);
			if (idx === -1) idx = 0;
			else if (e.key === "ArrowDown") idx++;
			else idx--;

			setActive(items.at(idx % items.length)?.id ?? null);
			e.preventDefault();
		}

		if (e.key === "Enter") {
			const selected = items.find((item) => item.id === active);

			if (selected) onOpen(selected);
			e.preventDefault();
		}
	});

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		const observer = new ResizeObserver(() => {
			const viewport = element.firstElementChild!;

			element.style.setProperty(
				"--fd-animated-height",
				`${viewport.clientHeight}px`,
			);
		});

		const viewport = element.firstElementChild;
		if (viewport) observer.observe(viewport);

		window.addEventListener("keydown", onKey);
		return () => {
			observer.disconnect();
			window.removeEventListener("keydown", onKey);
		};
	}, [onKey]);

	useOnChange(items, () => {
		if (items && items.length > 0) {
			setActive(items[0].id);
		}
	});

	return (
		<div
			{...props}
			ref={ref}
			data-empty={items === null}
			className={cn(
				"overflow-hidden h-(--fd-animated-height) transition-[height]",
				props.className,
			)}
		>
			<div
				className={cn(
					"w-full flex flex-col overflow-y-auto max-h-[460px] p-1",
					!items && "hidden",
				)}
			>
				<ListContext.Provider
					value={useMemo(
						() => ({
							active,
							setActive,
						}),
						[active],
					)}
				>
					{items?.length === 0 && Empty()}

					{items?.map((item) => (
						<Fragment key={item.id}>
							<SearchDialogListItem item={item} onClick={() => onOpen(item)} />
						</Fragment>
					))}
				</ListContext.Provider>
			</div>
		</div>
	);
}

function SearchDialogListItem({
	item,
	className,
	children,
	renderHighlights: render = renderHighlights,
	...props
}: ComponentProps<"button"> & {
	renderHighlights?: typeof renderHighlights;
	item: Omit<SortedResult, "content"> & {
		external?: boolean;
		content: React.ReactNode;
	};
}) {
	const { active: activeId, setActive } = useSearchList();
	const active = item.id === activeId;

	const pageIconClassName =
		"size-6 text-fd-muted-foreground bg-fd-muted border p-0.5 rounded-sm shadow-sm shrink-0";
	const icons = {
		text: null,
		heading: <HashIcon className="size-4 shrink-0 text-fd-muted-foreground" />,
		page: item.id.startsWith("resources:") ? (
			<BoxIcon className={pageIconClassName} />
		) : (
			<FileTextIcon className={pageIconClassName} />
		),
	};

	return (
		<button
			type="button"
			ref={useCallback(
				(element: HTMLButtonElement | null) => {
					if (active && element) {
						scrollIntoView(element, {
							scrollMode: "if-needed",
							block: "nearest",
							boundary: element.parentElement,
						});
					}
				},
				[active],
			)}
			aria-selected={active}
			className={cn(
				"relative flex select-none flex-row items-center gap-2 p-2 text-start text-sm rounded-sm",
				item.type !== "page" && "ps-8",
				item.type === "page" || item.type === "heading"
					? "font-medium"
					: "text-fd-popover-foreground/80",
				active && "bg-fd-accent dark:bg-fd-accent/50 text-fd-accent-foreground",
				className,
			)}
			onPointerMove={() => setActive(item.id)}
			{...props}
		>
			{children ?? (
				<>
					{item.type !== "page" && (
						<div
							role="none"
							className="absolute start-4.5 inset-y-0 w-px bg-fd-border"
						/>
					)}
					{icons[item.type]}
					<p className="min-w-0 truncate">
						{item.contentWithHighlights
							? render(item.contentWithHighlights)
							: item.content}
					</p>
				</>
			)}
		</button>
	);
}
