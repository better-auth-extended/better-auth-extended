"use client";

import { useStore } from "@nanostores/react";
import { $bookmarks } from "./atoms";
import { Row, Table } from "@tanstack/react-table";

export const getBookmarks = () => {
	return $bookmarks.get();
};

export const addBookmarks = (...resources: string[]) => {
	const current = getBookmarks();
	const updated = [...current];

	for (const resource of resources) {
		const index = updated.indexOf(resource);
		if (index !== -1) {
			updated.splice(index, 1);
		} else {
			updated.push(resource);
		}
	}
	$bookmarks.set(updated);
};

export const useBookmarks = () => {
	const bookmarks = useStore($bookmarks);

	return bookmarks;
};

export const isHidden = <TData>(
	table: Table<TData> | Row<TData>,
	columnId: string,
) => {
	const column =
		"getColumn" in table
			? table.getColumn(columnId)
			: table.getAllCells().find((cell) => cell.column.id === columnId)?.column;
	if (!column) {
		return false;
	}

	return !column.getIsVisible();
};
