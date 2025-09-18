import { DocsLayout } from "@/components/docs/docs";
import { docsOptions } from "@/layout.config";

export default function Layout({ children }: LayoutProps<"/docs">) {
	return <DocsLayout {...docsOptions}>{children}</DocsLayout>;
}
