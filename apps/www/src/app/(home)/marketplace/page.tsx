"use client";

import { Button } from "@/components/ui/button";
import { BookmarkIcon, Grid2x2Icon, ListIcon, Table2Icon } from "lucide-react";
import { columns, multiColumnFilterFn } from "./_components/columns";
import {
	ColumnFiltersState,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	PaginationState,
	SortingState,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table";
import { Toolbar } from "@/components/data-table/toolbar";
import { useEffect, useId, useMemo, useState } from "react";
import { Pagination } from "@/components/data-table/pagination";
import { Sort } from "./_components/sort";
import { cn } from "@/lib/utils";
import { GridView } from "./_components/grid-view";
import { resources } from "~/resources";
import { categories } from "~/categories";
import { ListView } from "./_components/list-view";
import { TableView } from "./_components/table-view";
import { BulkActions } from "@/components/data-table/bulk-actions";
import { addBookmarks, useBookmarks } from "./_components/utils";
import { useMounted } from "@/hooks/use-mounted";

const Items = () => {
	const id = useId();
	const [view, setView] = useState<"table" | "grid" | "list">("grid");
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [sorting, setSorting] = useState<SortingState>([
		{
			id: "dateAdded",
			desc: true,
		},
	]);
	const [globalFilter, setGlobalFilter] = useState<string | undefined>("");
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 20,
	});

	const mounted = useMounted();

	const bookmarks = useBookmarks();

	const data = useMemo(
		() => [
			...resources.filter(({ name }) => bookmarks.includes(name)),
			...resources.filter(({ name }) => !bookmarks.includes(name)),
		],
		[bookmarks],
	);

	// TODO: Sync state with url

	useEffect(() => {
		setSorting((prev) => {
			const withoutRank = prev.filter((s) => s.id !== "_bookmarkRank");
			return [{ id: "_bookmarkRank", desc: true }, ...withoutRank];
		});
	}, []);

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
			pagination,
		},
		columnResizeMode: "onChange",
		globalFilterFn: multiColumnFilterFn,
		getRowId: (row) => row.name,
		onPaginationChange: setPagination,
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

	if (!mounted) {
		return null;
	}

	return (
		<>
			<Toolbar
				table={table}
				searchKey="name"
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
				<div className="flex items-center *:size-8 *:not-first:rounded-l-none *:not-first:border-l-0 *:not-last:rounded-r-none">
					<Button
						variant="outline"
						size="icon"
						className={cn(
							"overflow-clip relative",
							view === "table" &&
								"after:absolute after:bottom-0 after:inset-x-0 after:border-b-2 after:border-b-primary after:rounded",
						)}
						onClick={() => setView("table")}
					>
						<Table2Icon />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className={cn(
							"overflow-clip relative",
							view === "grid" &&
								"after:absolute after:bottom-0 after:inset-x-0 after:border-b-2 after:border-b-primary after:rounded",
						)}
						onClick={() => setView("grid")}
					>
						<Grid2x2Icon />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className={cn(
							"overflow-clip relative",
							view === "list" &&
								"after:absolute after:bottom-0 after:inset-x-0 after:border-b-2 after:border-b-primary after:rounded",
						)}
						onClick={() => setView("list")}
					>
						<ListIcon />
					</Button>
				</div>
			</Toolbar>
			{table.getRowModel().rows.length > 0 ? (
				<>
					{view === "grid" && <GridView table={table} />}
					{view === "list" && <ListView table={table} />}
					{view === "table" && <TableView table={table} />}
				</>
			) : (
				<p>No results.</p>
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
Items.displayName = "Items";

export default function Home() {
	return (
		<>
			<div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20 h-[1500px]">
				<div className="flex flex-col gap-6 mx-auto max-w-7xl @container/content">
					<Items />
				</div>
			</div>
		</>
	);
}
