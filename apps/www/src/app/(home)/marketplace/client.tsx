"use client";

import { useMounted } from "@/hooks/use-mounted";
import {
	parseAsIndex,
	parseAsInteger,
	parseAsJson,
	parseAsString,
	parseAsStringEnum,
	useQueryState,
	useQueryStates,
} from "nuqs";
import { Suspense, useId, useMemo } from "react";
import { z } from "zod";
import { addBookmarks, useBookmarks } from "./_components/utils";
import {
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { resources } from "~/resources";
import { columns, multiColumnFilterFn } from "./_components/columns";
import { Toolbar } from "@/components/data-table/toolbar";
import { categories } from "~/categories";
import { Sort } from "./_components/sort";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	ArrowRightIcon,
	BookmarkIcon,
	GitPullRequestCreateArrow,
	Grid2x2Icon,
	Inbox,
	ListIcon,
	Loader2Icon,
	Table2Icon,
} from "lucide-react";
import { GridView } from "./_components/grid-view";
import { ListView } from "./_components/list-view";
import { TableView } from "./_components/table-view";
import { Pagination } from "@/components/data-table/pagination";
import { BulkActions } from "@/components/data-table/bulk-actions";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { owner, repo } from "@/lib/github";

const MainView = () => {
	const id = useId();
	const [tab, setTab] = useQueryState(
		"tab",
		parseAsStringEnum(["table", "grid", "list"]).withDefault("grid"),
	);
	const [columnVisibility, setColumnVisibility] = useQueryState(
		"view",
		parseAsJson(z.record(z.string(), z.boolean())).withDefault({}),
	);
	const [sorting, setSorting] = useQueryState("sort", {
		parse(value) {
			return [
				{
					id: "_bookmarkRank",
					desc: true,
				},
				...z
					.object({
						id: z.string(),
						desc: z.boolean(),
					})
					.array()
					.parse(JSON.parse(value)),
			];
		},
		defaultValue: [
			{ id: "_bookmarkRank", desc: true },
			{
				id: "dateAdded",
				desc: true,
			},
		],
		serialize(value) {
			return JSON.stringify(value.filter((v) => v.id !== "_bookmarkRank"));
		},
	});
	const [globalFilter, setGlobalFilter] = useQueryState(
		"query",
		parseAsString
			.withOptions({
				limitUrlUpdates: {
					method: "debounce",
					timeMs: 300,
				},
			})
			.withDefault(""),
	);
	const [pagination, setPagination] = useQueryStates({
		page: parseAsIndex.withDefault(0).withOptions({
			scroll: true,
		}),
		size: parseAsInteger.withDefault(20).withOptions({
			scroll: true,
		}),
	});
	const [columnFilters, setColumnFilters] = useQueryState(
		"filter",
		parseAsJson(
			z
				.object({
					id: z.string(),
					value: z.json(),
				})
				.array(),
		).withDefault([]),
	);

	const mounted = useMounted();

	const bookmarks = useBookmarks();

	const data = useMemo(() => {
		const THRESHOLD_DAYS = 14;
		const now = Date.now();

		return [
			...resources.filter(({ name }) => bookmarks.includes(name)),
			...resources.filter(({ name }) => !bookmarks.includes(name)),
		].map((item) => {
			const date = item.dateAdded ? new Date(item.dateAdded) : null;
			const isNew =
				!date || now - date.getTime() <= THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

			return {
				...item,
				isNew,
			};
		});
	}, [bookmarks]);

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnVisibility: {
				...columnVisibility,
				bookmarked: false,
				_bookmarkRank: false,
			},
			globalFilter,
			columnFilters,
			pagination: {
				pageIndex: pagination.page,
				pageSize: pagination.size,
			},
		},
		columnResizeMode: "onChange",
		globalFilterFn: multiColumnFilterFn,
		getRowId: (row) => row.name,
		onPaginationChange: (updater) => {
			setPagination((old) => {
				const next =
					typeof updater === "function"
						? updater({
								pageIndex: old.page,
								pageSize: old.size,
							})
						: updater;

				return {
					page: next.pageIndex,
					size: next.pageSize,
				};
			});
		},
		// @ts-expect-error
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		getPaginationRowModel: getPaginationRowModel(),
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	const shouldReduceMotion = useReducedMotion();

	return (
		<>
			{mounted ? (
				<Toolbar
					table={table}
					filters={[
						{
							columnId: "category",
							title: "Category",
							options: Object.entries(categories).map(([id, config]) => {
								return {
									label: config.name,
									value: id,
									icon: "icon" in config ? config.icon : undefined,
								};
							}),
						},
						<Sort key={`${id}-sorting`} table={table} />,
					]}
				>
					<div className="hidden md:flex items-center *:size-8 *:not-first:rounded-l-none *:not-first:border-l-0 *:not-last:rounded-r-none">
						<Button
							variant="outline"
							size="icon"
							className={cn(
								"overflow-clip relative",
								tab === "table" &&
									"after:absolute after:bottom-0 after:inset-x-0 after:border-b-2 after:border-b-primary after:rounded",
							)}
							onClick={() => setTab("table")}
						>
							<Table2Icon />
							<span className="sr-only">View as table</span>
						</Button>
						<Button
							variant="outline"
							size="icon"
							className={cn(
								"overflow-clip relative",
								tab === "grid" &&
									"after:absolute after:bottom-0 after:inset-x-0 after:border-b-2 after:border-b-primary after:rounded",
							)}
							onClick={() => setTab("grid")}
						>
							<Grid2x2Icon />
							<span className="sr-only">View as grid</span>
						</Button>
						<Button
							variant="outline"
							size="icon"
							className={cn(
								"overflow-clip relative",
								tab === "list" &&
									"after:absolute after:bottom-0 after:inset-x-0 after:border-b-2 after:border-b-primary after:rounded",
							)}
							onClick={() => setTab("list")}
						>
							<ListIcon />
							<span className="sr-only">View as list</span>
						</Button>
					</div>
				</Toolbar>
			) : (
				<div className="flex items-start flex-wrap-reverse gap-2">
					<div className="flex flex-1 flex-wrap-reverse items-start gap-y-2 space-x-2">
						<div className="relative">
							<Skeleton className="h-8 w-full min-w-[200px] lg:w-[250px]" />
						</div>
						<div className="flex gap-x-2">
							<Skeleton className="h-8 min-w-[100px]" />
							<Skeleton className="h-8 min-w-[210px]" />
						</div>
					</div>
					<div className="ms-auto flex items-center gap-2">
						<Skeleton className="hidden lg:block h-8 min-w-[76px]" />
						<Skeleton className="h-8 min-w-[96px]" />
					</div>
				</div>
			)}
			{mounted ? (
				table.getRowModel().rows.length > 0 ? (
					<>
						{tab === "grid" && <GridView table={table} />}
						{tab === "list" && <ListView table={table} />}
						{tab === "table" && <TableView table={table} />}
					</>
				) : (
					<motion.div
						variants={
							!shouldReduceMotion
								? {
										hidden: {
											opacity: 0,
											y: 10,
										},
										visible: {
											y: 0,
											opacity: 1,
											transition: {
												type: "spring",
												stiffness: 260,
												damping: 28,
												duration: 0.2,
											},
										},
									}
								: undefined
						}
						initial="hidden"
						animate="visible"
						exit="hidden"
					>
						<Card className="border-dashed">
							<CardHeader className="text-center py-6 flex flex-col items-center justify-center">
								<div className="mb-4 bg-surface flex items-center justify-center size-11 rounded-full border">
									<Inbox className="size-5 text-surface-foreground" />
								</div>
								<CardTitle>No items found matching your criteria.</CardTitle>
								<CardDescription>
									Try adjusting your search or filter settings.
								</CardDescription>
							</CardHeader>
						</Card>
					</motion.div>
				)
			) : (
				<div className="min-h-96 grid place-items-center">
					<Loader2Icon className="size-5 text-muted-foreground animate-spin repeat-infinite" />
				</div>
			)}
			<Pagination table={table} />
			<BulkActions table={table} entityName="item">
				<div className="flex items-center gap-1.5">
					<Button
						variant="outline"
						size="sm"
						className="h-8"
						onClick={() => {
							const rows = table
								.getFilteredSelectedRowModel()
								.rows.map((row) => row.original.name);

							addBookmarks(...rows);
						}}
					>
						<BookmarkIcon className="-ms-0.5" />
						<span>Bookmark</span>
					</Button>
				</div>
			</BulkActions>
		</>
	);
};
MainView.displayName = "MainView";

const MotionCard = motion.create(Card);

export const Marketplace = () => {
	const mounted = useMounted();
	const shouldReduceMotion = useReducedMotion();

	return (
		<>
			<div className="flex-1 font-sans p-8 pb-16 md:p-16 lg:pb-20 lg:p-20">
				<div className="flex flex-col gap-16 mx-auto max-w-7xl @container/content">
					<div className="flex flex-col gap-6">
						<div className="space-y-2">
							{/* <div className="mb-0.5 size-8 rounded-full border grid place-items-center">
								<BoxesIcon className="size-4 text-muted-foreground" />
							</div> */}
							<motion.h1
								className="text-3xl font-medium"
								variants={
									!shouldReduceMotion
										? {
												hidden: {
													opacity: 0,
													y: 20,
												},
												visible: {
													opacity: 1,
													y: 0,
												},
											}
										: undefined
								}
								initial="hidden"
								animate="visible"
								exit="hidden"
							>
								Marketplace
							</motion.h1>
							<motion.p
								className="text-muted-foreground"
								variants={
									!shouldReduceMotion
										? {
												hidden: {
													opacity: 0,
													y: 20,
												},
												visible: {
													opacity: 1,
													y: 0,
												},
											}
										: undefined
								}
								initial="hidden"
								animate="visible"
								exit="hidden"
							>
								Discover and share free open-source resources and plugins for
								Better Auth.
							</motion.p>
						</div>
						<Suspense>
							<MainView />
						</Suspense>
					</div>
					{mounted && (
						<MotionCard
							variants={
								!shouldReduceMotion
									? {
											hidden: {
												opacity: 0,
												y: 20,
											},
											visible: {
												opacity: 1,
												y: 0,
											},
										}
									: undefined
							}
							viewport={{ once: true, amount: 0.4 }}
							initial="hidden"
							whileInView="visible"
							exit="hidden"
						>
							<CardHeader className="flex flex-col md:flex-row justify-between md:items-center gap-6">
								<div className="space-y-2">
									<div
										className="rounded-full size-9 border bg-surface flex items-center justify-center"
										aria-hidden="true"
									>
										<GitPullRequestCreateArrow className="size-3.5 text-surface-foreground" />
									</div>
									<CardTitle className="text-2xl">
										Contribute to the Marketplace
									</CardTitle>
									<CardDescription className="text-base max-w-3xl">
										Got a free open-source project or resource related to Better
										Auth? Share it with the community! Open a PR and help expand
										this curated collection of tools, plugins, and resources.
									</CardDescription>
								</div>
								<Link
									href={`https://github.com/${owner}/${repo}/compare/main...my-branch?template=marketplace.md`}
									className={buttonVariants({
										className: "md:ms-auto",
									})}
									rel="noreferrer noopener"
									target="_blank"
								>
									<GitHubLogoIcon />
									Open a PR
									<ArrowRightIcon className="-mr-1" />
								</Link>
							</CardHeader>
						</MotionCard>
					)}
				</div>
			</div>
		</>
	);
};
Marketplace.displayName = "Marketplace";
