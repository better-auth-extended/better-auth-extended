import { persistentAtom } from "@nanostores/persistent";

export const $bookmarks = persistentAtom<string[]>("bookmark", [], {
	encode: JSON.stringify,
	decode: JSON.parse,
});
