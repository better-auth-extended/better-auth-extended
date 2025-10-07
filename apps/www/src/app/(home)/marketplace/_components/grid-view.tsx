"use client";

import type { Table } from "@tanstack/react-table";
import { GridItem } from "./grid-item";
import type { Resource } from "~/resources";
import { useMounted } from "@/hooks/use-mounted";
import { Skeleton } from "@/components/ui/skeleton";

export const GridView = ({ table }: { table: Table<Resource> }) => {
	const mounted = useMounted();

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{mounted ? (
				table
					.getRowModel()
					.rows.map((row) => <GridItem key={row.id} row={row} />)
			) : (
				<>
					<Skeleton className="size-full h-54" />
					<Skeleton className="size-full h-54" />
					<Skeleton className="size-full h-54" />
					<Skeleton className="size-full h-54" />
					<Skeleton className="size-full h-54 hidden lg:block" />
					<Skeleton className="size-full h-54 hidden lg:block" />
				</>
			)}
		</div>
	);
};
GridView.displayName = "GridView";
