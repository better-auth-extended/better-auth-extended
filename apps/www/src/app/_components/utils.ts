"use client";

import { useStore } from "@nanostores/react";
import { $bookmarks } from "./atoms";

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
