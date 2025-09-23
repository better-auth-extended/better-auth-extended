"use client";

import { Table } from "@tanstack/react-table";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";

export type ViewOptionsProps<TData> = {
	table: Table<TData>;
};

export const ViewOptions = <TData,>({ table }: ViewOptionsProps<TData>) => {
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="hidden h-8 lg:flex">
					<MixerHorizontalIcon className="size-4" />
					View
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[150px]">
				<DropdownMenuLabel className="text-xs">
					Toggle columns
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{table
					.getAllColumns()
					.filter(
						(column) =>
							typeof column.accessorFn !== "undefined" && column.getCanHide(),
					)
					.map((column) => {
						return (
							<DropdownMenuCheckboxItem
								key={column.id}
								className="capitalize"
								checked={column.getIsVisible()}
								onCheckedChange={(value) => column.toggleVisibility(!!value)}
								onSelect={(e) => e.preventDefault()}
							>
								{(column.columnDef.meta as any)?.displayName ?? column.id}
							</DropdownMenuCheckboxItem>
						);
					})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
ViewOptions.displayName = "ViewOptions";
