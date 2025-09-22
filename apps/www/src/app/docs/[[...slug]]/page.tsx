import { source } from "@/lib/source";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/components/mdx-components";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Socials } from "@/components/socials";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from "@/components/docs/page";
import { absoluteUrl } from "@/lib/utils";
import { baseUrl } from "@/lib/metadata";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
	const params = await props.params;
	const page = source.getPage(params.slug);
	if (!page) notFound();

	const MDX = page.data.body;

	return (
		<DocsPage
			toc={page.data.toc}
			full={page.data.full}
			editOnGithub={{
				owner: "jslno",
				repo: "better-auth-extended",
				sha: "main",
				path: `apps/www/content/docs/${params.slug?.join("/")}.mdx`,
			}}
			tableOfContent={{
				header: <div className="w-10 h-4"></div>,
			}}
			footer={{
				enabled: true,
				component: <Footer className="mt-4" variant="docs" />,
			}}
		>
			<DocsTitle>{page.data.title}</DocsTitle>
			<DocsDescription>{page.data.description}</DocsDescription>
			{/* TODO: LLM Header */}
			<DocsBody>
				<MDX components={getMDXComponents()} />
			</DocsBody>
		</DocsPage>
	);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug?: string[] }>;
}) {
	const { slug } = await params;
	const page = source.getPage(slug);
	if (page == null) notFound();
	const url = new URL(`${baseUrl}/api/og`);
	const { title, description } = page.data;
	const pageSlug = page.path;
	url.searchParams.set("type", "Documentation");
	url.searchParams.set("mode", "dark");
	url.searchParams.set("heading", `${title}`);

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: "website",
			url: absoluteUrl(`docs/${pageSlug}`),
			images: [
				{
					url: url.toString(),
					width: 1200,
					height: 630,
					alt: title,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [url.toString()],
		},
	};
}
