"use client";

import { Table } from "@tanstack/react-table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	CalendarIcon,
	SortAscIcon,
	SortDescIcon,
	TextIcon,
} from "lucide-react";
import { Resource } from "~/resources";

export type SortProps = {
	table: Table<Resource>;
};

export const Sort = ({ table }: SortProps) => {
	const sortOptions = [
		{
			key: "date-desc",
			id: "dateAdded",
			desc: true,
			label: "Date (Newest first)",
			icon: <CalendarIcon className="size-4 mr-2" />,
			directionIcon: <SortDescIcon className="size-4 ml-2 inline" />,
		},
		{
			key: "date-asc",
			id: "dateAdded",
			desc: false,
			label: "Date (Oldest first)",
			icon: <CalendarIcon className="size-4 mr-2" />,
			directionIcon: <SortAscIcon className="size-4 ml-2 inline" />,
		},
		{
			key: "name-asc",
			id: "name",
			desc: false,
			label: "Name (A-Z)",
			icon: <TextIcon className="size-4 mr-2" />,
			directionIcon: <SortDescIcon className="size-4 ml-2 inline" />,
		},
		{
			key: "name-desc",
			id: "name",
			label: "Name (Z-A)",
			desc: true,
			icon: <TextIcon className="size-4 mr-2" />,
			directionIcon: <SortAscIcon className="size-4 ml-2 inline" />,
		},
	] as const;
	const sorting = table.getState().sorting;
	const selectedOption =
		sortOptions.find((option) => {
			const currentSorting = sorting[1];

			return (
				option.id === currentSorting?.id && option.desc === currentSorting?.desc
			);
		}) ?? sortOptions[0];
	const handleSortChange = (value: string) => {
		const option = sortOptions.find((option) => {
			return option.key === value;
		});
		if (option) {
			const next = [
				{ id: "_bookmarkRank", desc: true },
				{ id: option.id, desc: option.desc },
			];
			table.setSorting(next as any);
		}
	};

	return (
		<Select
			value={selectedOption.key}
			defaultValue="date-desc"
			onValueChange={handleSortChange}
		>
			<SelectTrigger className="h-8! bg-background hover:bg-accent dark:bg-input/30 dark:hover:bg-input/50 border-dashed dark:border-input transition-colors">
				<SelectValue>
					<span className="flex items-center">
						{selectedOption.icon}
						<span className="truncate font-medium">{selectedOption.label}</span>
						{selectedOption.directionIcon}
					</span>
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{sortOptions.map((option) => (
					<SelectItem key={option.key} value={option.key}>
						<div className="flex items-center">
							{option.icon}
							<div className="truncate">{option.label}</div>
							{option.directionIcon}
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};
Sort.displayName = "Sort";
