import type { Table } from "@tanstack/react-table";
import { ListItem } from "./list-item";
import type { Resource } from "~/resources";
import { useMounted } from "@/hooks/use-mounted";
import { Skeleton } from "@/components/ui/skeleton";

export const ListView = ({ table }: { table: Table<Resource> }) => {
	const mounted = useMounted();

	return (
		<div className="grid grid-cols-1 gap-4">
			{mounted ? (
				table
					.getRowModel()
					.rows.map((row) => <ListItem key={row.id} row={row} />)
			) : (
				<>
					<Skeleton className="size-full h-42" />
					<Skeleton className="size-full h-42" />
					<Skeleton className="size-full h-42" />
					<Skeleton className="size-full h-42" />
				</>
			)}
		</div>
	);
};
