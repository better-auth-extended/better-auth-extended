import { DocsLayout } from "@/components/docs/docs";
import { Navbar } from "@/components/navbar";
import { docsOptions } from "@/layout.config";

export default function Layout({ children }: LayoutProps<"/docs">) {
	return (
		<>
			<Navbar />
			<DocsLayout {...docsOptions}>{children}</DocsLayout>
		</>
	);
}
