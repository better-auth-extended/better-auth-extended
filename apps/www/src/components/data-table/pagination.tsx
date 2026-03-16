"use client";

import { cn, getPageNumbers } from "@/lib/utils";
import { Table } from "@tanstack/react-table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
} from "lucide-react";
import { useMounted } from "@/hooks/use-mounted";
import { Skeleton } from "../ui/skeleton";

export type PaginationProps<TData> = {
	table: Table<TData>;
};

export const Pagination = <TData,>({ table }: PaginationProps<TData>) => {
	const currentPage = table.getState().pagination.pageIndex + 1;
	const totalPages = table.getPageCount();
	const pageNumbers = getPageNumbers(currentPage, totalPages);
	const mounted = useMounted();

	if (!mounted) {
		return (
			<div
				className={cn(
					"flex items-center justify-between overflow-clip",
					"@max-2xl/container:flex-col-reverse @max-2xl/container:gap-4",
				)}
				style={{ overflowClipMargin: 1 }}
			>
				<div className="flex w-full items-center">
					<Skeleton className="h-4 w-[74px] mr-4 @3xl/content:hidden" />
					<div className="flex items-center gap-2 @max-2xl/container:flex-row-reverse">
						<Skeleton className="h-8 w-[70px]" />
						<Skeleton className="h-3 w-[100px] hidden sm:block" />
					</div>
				</div>

				<div className="flex items-center sm:space-x-6 lg:space-x-8">
					<Skeleton className="h-3 w-[100px] @max-3xl/content:hidden" />
					<div className="flex items-center space-x-2">
						<Skeleton className="size-8 @max-md/content:hidden" />
						<Skeleton className="size-8" />

						<Skeleton className="size-8" />

						<Skeleton className="size-8" />
						<Skeleton className="size-8 @max-md/content:hidden" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"flex items-center justify-between",
				"@max-2xl/container:flex-col-reverse @max-2xl/container:gap-4",
			)}
			style={{ overflowClipMargin: 1 }}
		>
			<div className="flex w-full items-center">
				<div className="flex w-[100px] items-center justify-center text-sm font-medium @3xl/content:hidden">
					Page {currentPage} of {totalPages}
				</div>
				<div className="flex items-center gap-2 @max-2xl/container:flex-row-reverse">
					<Select
						value={`${table.getState().pagination.pageSize}`}
						onValueChange={(value) => {
							table.setPageSize(Number(value));
						}}
					>
						<SelectTrigger className="h-8 w-[70px]">
							<SelectValue placeholder={table.getState().pagination.pageSize} />
						</SelectTrigger>
						<SelectContent side="top">
							{[10, 20, 30, 40, 50].map((pageSize) => (
								<SelectItem key={pageSize} value={`${pageSize}`}>
									{pageSize}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className="hidden text-sm font-medium sm:block">Items per page</p>
				</div>
			</div>

			<div className="flex items-center sm:space-x-6 lg:space-x-8">
				<div className="flex w-[100px] items-center justify-center text-sm font-medium @max-3xl/content:hidden">
					Page {currentPage} of {totalPages}
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						className="size-8 p-0 @max-md/content:hidden"
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Go to first page</span>
						<ChevronsLeftIcon className="size-4" />
					</Button>
					<Button
						variant="outline"
						className="size-8 p-0"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Go to previous page</span>
						<ChevronLeftIcon className="size-4" />
					</Button>

					{/* Page number buttons */}
					{pageNumbers.map((pageNumber, index) => (
						<div key={`${pageNumber}-${index}`} className="flex items-center">
							{pageNumber === "..." ? (
								<span className="text-muted-foreground px-1 text-sm">...</span>
							) : (
								<Button
									variant={currentPage === pageNumber ? "default" : "outline"}
									className="h-8 min-w-8 px-2"
									onClick={() => table.setPageIndex((pageNumber as number) - 1)}
								>
									<span className="sr-only">Go to page {pageNumber}</span>
									{pageNumber}
								</Button>
							)}
						</div>
					))}

					<Button
						variant="outline"
						className="size-8 p-0"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						<span className="sr-only">Go to next page</span>
						<ChevronRightIcon className="size-4" />
					</Button>
					<Button
						variant="outline"
						className="size-8 p-0 @max-md/content:hidden"
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
					>
						<span className="sr-only">Go to last page</span>
						<ChevronsRightIcon className="size-4" />
					</Button>
				</div>
			</div>
		</div>
	);
};
