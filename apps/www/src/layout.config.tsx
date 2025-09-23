import { source } from "@/lib/source";
import { DocsLayoutProps } from "./components/docs/docs";

export const docsOptions: Omit<DocsLayoutProps, "children"> = {
	tree: source.pageTree,
};
