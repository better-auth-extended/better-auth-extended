import { source } from "@/lib/source";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/components/mdx-components";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from "@/components/docs/page";
import { baseUrl } from "@/lib/metadata";
import { StatusBadges } from "@/components/status-badges";
import { GithubButton } from "@/components/github-button";
import { NpmButton } from "@/components/npm-button";
import path from "node:path";
import { LLMCopyButton, ViewOptions } from "@/components/page-actions";
import { DocsFooter } from "./_components/footer";
import { owner, repo } from "@/lib/github";

const removeExt = (fullPath: string) => {
	const parsed = path.parse(fullPath);
	return path.join(parsed.dir, parsed.name);
};

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
	const params = await props.params;
	const page = source.getPage(params.slug);
	if (!page) notFound();

	const MDX = page.data.body;

	return (
		<DocsPage
			toc={page.data.toc}
			full={page.data.full}
			tableOfContent={{
				header: <div className="w-10 h-4"></div>,
			}}
			footer={{
				enabled: true,
				component: (
					<DocsFooter
						editOnGithub={{
							owner,
							repo,
							sha: "main",
							path: `apps/www/content/docs/${params.slug?.join("/")}.mdx`,
						}}
					/>
				),
			}}
		>
			<div className="space-y-4">
				<DocsTitle>{page.data.title}</DocsTitle>
				<DocsDescription className="-mb-3">
					{page.data.description}
				</DocsDescription>
			</div>
			{!!page.data.packageName && (
				<div>
					<StatusBadges npmPackage={page.data.packageName} />
				</div>
			)}
			<div className="mb-4 flex items-center gap-2">
				<LLMCopyButton markdownUrl={`${page.url}.mdx`} />
				<ViewOptions
					markdownUrl={`${page.url}.mdx`}
					githubUrl={`https://github.com/${owner}/${repo}/tree/main/apps/www/content/docs/${page.path}`}
				/>
				{!!page.data.packageName && (
					<div className="flex items-center gap-2">
						<GithubButton
							label="Source"
							username={owner}
							repository={repo}
							path={`/packages/${removeExt(page.path)}`}
						/>
						<NpmButton packageName={page.data.packageName} />
					</div>
				)}
			</div>
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
	const url = new URL(`${baseUrl}api/og`);
	const { title, description, packageName } = page.data;
	const pageSlug = page.path;
	url.searchParams.set("type", "Documentation");
	if (page.data.description) {
		url.searchParams.set("description", `${page.data.description}`);
	}
	if (packageName) {
		url.searchParams.set("packageName", `${packageName}`);
	}
	url.searchParams.set("category", `${page.slugs[0]}`);
	url.searchParams.set("mode", "dark");
	url.searchParams.set("heading", `${title}`);

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: "website",
			url: `${baseUrl}docs/${removeExt(pageSlug)}`,
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
