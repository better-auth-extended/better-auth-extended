"use client";

import type { Table } from "@tanstack/react-table";
import { GridItem } from "./grid-item";
import type { Resource } from "~/resources";
import { AnimatePresence } from "motion/react";
import { SmoothArea } from "./smooth-area";

export const GridView = ({ table }: { table: Table<Resource> }) => {
	return (
		<SmoothArea className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			<AnimatePresence mode="popLayout">
				{table.getRowModel().rows.map((row) => (
					<GridItem key={row.id} row={row} />
				))}
			</AnimatePresence>
		</SmoothArea>
	);
};
GridView.displayName = "GridView";
