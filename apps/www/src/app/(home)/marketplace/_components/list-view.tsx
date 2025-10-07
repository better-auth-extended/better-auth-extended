import type { Table } from "@tanstack/react-table";
import { ListItem } from "./list-item";
import type { Resource } from "~/resources";
import { SmoothArea } from "./smooth-area";

export const ListView = ({ table }: { table: Table<Resource> }) => {
	return (
		<SmoothArea className="grid grid-cols-1 gap-4">
			{table.getRowModel().rows.map((row) => (
				<ListItem key={row.id} row={row} />
			))}
		</SmoothArea>
	);
};
