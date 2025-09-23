"use client";

import type { Table } from "@tanstack/react-table";
import { GridItem } from "./grid-item";
import type { Resource } from "~/resources";

export const GridView = ({ table }: { table: Table<Resource> }) => {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{table.getRowModel().rows.map((row) => (
				<GridItem key={row.id} row={row} />
			))}
		</div>
	);
};
GridView.displayName = "GridView";
