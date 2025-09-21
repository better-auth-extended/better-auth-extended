"use client";

import {
	ColumnDef,
	FilterFn,
	SortingFn,
	sortingFns,
} from "@tanstack/react-table";
import { Resource } from "~/resources";
import { CategoryBadge } from "./category-badge";
import { BookmarkIcon, CalendarIcon } from "lucide-react";
import { GithubUser } from "@/components/github-user";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect } from "react";
import { addBookmarks, getBookmarks } from "./utils";
import { $bookmarks } from "./atoms";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const bookmarkSortingWrapper = (
	inner: SortingFn<Resource>,
): SortingFn<Resource> => {
	return (rowA, rowB, columnId) => {
		const bookmarks = getBookmarks();
		const aBookmarked = bookmarks.includes(rowA.original.name);
		const bBookmarked = bookmarks.includes(rowB.original.name);

		if (aBookmarked && !bBookmarked) return -1;
		if (!aBookmarked && bBookmarked) return 1;

		return inner(rowA, rowB, columnId);
	};
};

const stringSortingFn: SortingFn<Resource> = (rowA, rowB, columnId) => {
	return sortingFns.alphanumeric(rowA, rowB, columnId);
};

const dateSortingFn: SortingFn<Resource> = (rowA, rowB, columnId) => {
	const a = rowA.getValue<Date>(columnId);
	const b = rowB.getValue<Date>(columnId);
	const aTime = a instanceof Date ? a.getTime() : new Date(a as any).getTime();
	const bTime = b instanceof Date ? b.getTime() : new Date(b as any).getTime();
	if (aTime === bTime) return 0;
	return aTime < bTime ? -1 : 1;
};

export const multiColumnFilterFn: FilterFn<Resource> = (
	row,
	_columnId,
	filterValue: string,
) => {
	const normalizeText = (text: string) => {
		return text
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/[-_\s@]/g, "")
			.toLowerCase();
	};

	const searchableRowContent = `${row.original.name} ${row.original.description} ${Array.isArray(row.original.author) ? row.original.author.join(" ") : row.original.author}`;

	return normalizeText(searchableRowContent).includes(
		normalizeText(filterValue),
	);
};

export const columns: ColumnDef<Resource>[] = [
	{
		id: "_bookmarkRank",
		accessorFn: (row) => (getBookmarks().includes(row.name) ? 1 : 0),
		enableHiding: false,
		enablePinning: false,
		enableResizing: false,
		enableSorting: true,
		size: 0,
		cell: () => null,
	},
	{
		id: "select",
		header: ({ table }) => {
			useEffect(() => {
				const handleKeyDown = (e: KeyboardEvent) => {
					const target = e.target as HTMLElement;
					if (target.tagName === "BODY" || target.tagName === "TABLE") {
						if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a") {
							e.preventDefault();
							e.stopPropagation();
							table.toggleAllPageRowsSelected();
						}
					}
				};

				window.addEventListener("keydown", handleKeyDown, { capture: true });

				return () => {
					window.removeEventListener("keydown", handleKeyDown, {
						capture: true,
					});
				};
			}, []);

			return (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all"
				/>
			);
		},
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
				onClick={(e) => {
					e.stopPropagation();
				}}
			/>
		),
		enableResizing: false,
		enablePinning: false,
		size: 30,
	},
	{
		accessorKey: "name",
		header: "Name",
		filterFn: multiColumnFilterFn,
		sortingFn: bookmarkSortingWrapper(stringSortingFn),
		enableHiding: false,
		cell: ({ row }) => {
			const bookmarked = !!row.getValue("bookmarked");
			return (
				<p className="truncate font-medium flex items-center gap-1.5">
					{row.getValue("name")}
					{row.original.isNew && (
						<Badge
							variant="outline"
							className="ml-1 border-dashed border-input"
							aria-hidden="true"
						>
							New
						</Badge>
					)}
					<Button
						variant="ghost"
						size="icon"
						className={cn(
							"size-6 transition-opacity",
							!bookmarked &&
								"opacity-0 group-focus-visible/row:opacity-100 group-hover/row:opacity-100",
						)}
						onClick={(e) => {
							e.stopPropagation();
							addBookmarks(row.original.name);
						}}
					>
						<BookmarkIcon
							className={cn(
								"size-3.5",
								bookmarked && "text-amber-500 fill-current",
							)}
						/>
						<span className="sr-only">Bookmark</span>
					</Button>
				</p>
			);
		},
	},
	{
		header: "Description",
		accessorKey: "description",
		size: 400,
		cell: ({ row }) => {
			return (
				<p className="truncate text-muted-foreground">
					{row.getValue("description")}
				</p>
			);
		},
	},
	{
		accessorKey: "category",
		header: "Category",
		cell: ({ row }) => {
			return <CategoryBadge category={row.getValue("category")} />;
		},
		filterFn: (row, columnId, filterValue: string[]) => {
			if (!filterValue?.length) return true;
			const rowValue = row.getValue<string>(columnId);
			return filterValue.includes(rowValue);
		},
		size: 100,
	},
	{
		accessorKey: "author",
		header: "Author",
		cell: ({ row }) => (
			<GithubUser
				user={row.getValue("author")}
				onClick={(e) => e.stopPropagation()}
			/>
		),
	},
	{
		accessorKey: "dateAdded",
		header: "Added",
		meta: {
			displayName: "Added",
		},
		sortingFn: bookmarkSortingWrapper(dateSortingFn),
		cell: ({ row }) => {
			const date = row.getValue<Date | undefined>("dateAdded");

			if (!date) {
				return null;
			}

			return (
				<div className="flex items-center gap-1.5">
					<CalendarIcon
						className="shrink-0 size-3.5 text-muted-foreground"
						aria-hidden="true"
					/>
					<p className="truncate">{date.toISOString().split("T")[0]}</p>
				</div>
			);
		},
		size: 100,
	},
	{
		id: "bookmarked",
		accessorFn: (original) => {
			return $bookmarks.get().includes(original.name);
		},
		enableSorting: false,
		enableHiding: false,
		enablePinning: false,
	},
];
