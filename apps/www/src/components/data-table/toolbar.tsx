"use client";

import { FacetedFilter } from "@/components/data-table/faceted-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@tanstack/react-table";
import { CircleXIcon, XIcon } from "lucide-react";
import React, { useEffect, useRef } from "react";

export type ToolbarProps<TData> = {
	table: Table<TData>;
	searchPlaceholder?: string;
	searchKey?: string;
	filters?: (
		| {
				columnId: string;
				title: string;
				options: {
					label: string;
					value: string;
					icon?: React.ComponentType<{ className?: string }>;
				}[];
		  }
		| React.JSX.Element
	)[];
	children?: React.ReactNode;
	disableSearchShortcut?: boolean;
};

export const Toolbar = <TData,>({
	table,
	searchPlaceholder = "Search...",
	searchKey,
	filters = [],
	children,
	disableSearchShortcut,
}: ToolbarProps<TData>) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const isFiltered =
		table.getState().columnFilters.length > 0 || table.getState().globalFilter;

	const handleClearInput = () => {
		searchKey
			? table.getColumn(searchKey)?.setFilterValue("")
			: table.setGlobalFilter("");
		inputRef.current?.focus();
	};

	useEffect(() => {
		if (disableSearchShortcut) {
			return;
		}
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLocaleLowerCase() === "k") {
				e.preventDefault();
				inputRef.current?.focus();
			}
		};

		window.addEventListener("keydown", handleKeyDown, { capture: true });

		return () => {
			window.removeEventListener("keydown", handleKeyDown, { capture: true });
		};
	}, []);

	return (
		<div className="flex items-center justify-between">
			<div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
				<div className="relative">
					{searchKey ? (
						<Input
							ref={inputRef}
							placeholder={searchPlaceholder}
							value={
								(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
							}
							onChange={(event) =>
								table.getColumn(searchKey)?.setFilterValue(event.target.value)
							}
							className="h-8 w-[150px] lg:w-[250px]"
						/>
					) : (
						<Input
							ref={inputRef}
							placeholder={searchPlaceholder}
							value={table.getState().globalFilter ?? ""}
							onChange={(event) => table.setGlobalFilter(event.target.value)}
							className="h-8 w-[150px] lg:w-[250px]"
						/>
					)}
					{(
						searchKey
							? table.getColumn(searchKey)?.getFilterValue()
							: table.getState().globalFilter
					) ? (
						<button
							className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
							aria-label="Clear input"
							onClick={handleClearInput}
						>
							<CircleXIcon size={16} aria-hidden="true" />
						</button>
					) : !disableSearchShortcut ? (
						<div className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2">
							<kbd className="text-muted-foreground/70 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
								⌘K
							</kbd>
						</div>
					) : null}
				</div>
				<div className="flex gap-x-2">
					{filters.map((filter) => {
						if ("columnId" in filter) {
							const column = table.getColumn(filter.columnId);
							if (!column) return null;
							return (
								<FacetedFilter
									key={filter.columnId}
									column={column}
									title={filter.title}
									options={filter.options}
								/>
							);
						}

						return filter;
					})}
				</div>
				{isFiltered && (
					<Button
						variant="ghost"
						onClick={() => {
							table.resetColumnFilters();
							table.setGlobalFilter("");
						}}
						className="h-8 px-2 lg:px-3"
					>
						<XIcon className="-ms-1 size-4" />
						Reset
					</Button>
				)}
			</div>
			{children}
		</div>
	);
};
Toolbar.displayName = "Toolbar";
