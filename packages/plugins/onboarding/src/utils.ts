import type { LiteralString } from "better-auth";

export function transformPath<T extends LiteralString>(
	path: T,
): TransformPath<T> {
	const result = path
		.split(/[-/]/g)
		.map((segment, index) => {
			if (segment.length === 0) return ""; // handle leading separators
			return segment.charAt(0).toUpperCase() + segment.slice(1);
		})
		.join("");

	return result as TransformPath<T>;
}

type CapitalizeFirst<S extends string> = S extends `${infer First}${infer Rest}`
	? `${Uppercase<First>}${Rest}`
	: S;

export type TransformPath<S extends string> =
	S extends `${infer Head}/${infer Tail}`
		? TransformPath<`${Head}${CapitalizeFirst<Tail>}`>
		: S extends `${infer Head}-${infer Tail}`
			? TransformPath<`${Head}${CapitalizeFirst<Tail>}`>
			: CapitalizeFirst<S>;

export function transformClientPath<T extends LiteralString>(
	path: T,
): TransformClientPath<T> {
	const result = path
		.replace(/[\/]+/g, "-")
		.replace(/([A-Z])([A-Z])/g, "$1-$2")
		.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
		.replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
		.replace(/^-+|-+$/g, "")
		.replace(/-+/g, "-")
		.toLowerCase();

	return result as TransformClientPath<T>;
}

type KebabStart<S extends string> = S extends `-${infer R}`
	? KebabStart<R>
	: S extends `/${infer R}`
		? KebabStart<R>
		: S extends `${infer F}${infer R}`
			? F extends Lowercase<F>
				? `${F}${KebabCont<R>}`
				: `${Lowercase<F>}${KebabCont<R>}`
			: S;

type KebabCont<S extends string> = S extends `${infer F}${infer R}`
	? F extends "-" | "/"
		? `-${KebabStart<R>}`
		: F extends Lowercase<F>
			? `${F}${KebabCont<R>}`
			: `-${Lowercase<F>}${KebabCont<R>}`
	: S;

export type TransformClientPath<S extends string> = KebabStart<S>;

export const toPath = (u?: string | URL) => {
	if (!u) return "";
	try {
		return new URL(u).pathname;
	} catch {
		const s = `${u}`;
		const q = s.indexOf("?");
		const h = s.indexOf("#");
		const end = Math.min(q === -1 ? s.length : q, h === -1 ? s.length : h);
		return s.slice(0, end);
	}
};
