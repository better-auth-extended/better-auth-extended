import type { Table } from "@tanstack/react-table";
import { ListItem } from "./list-item";
import { SmoothArea } from "./smooth-area";
import type { TResource } from "./columns";

export const ListView = ({ table }: { table: Table<TResource> }) => {
	return (
		<SmoothArea className="grid grid-cols-1 gap-4">
			{table.getRowModel().rows.map((row) => (
				<ListItem key={row.id} row={row} />
			))}
		</SmoothArea>
	);
};
