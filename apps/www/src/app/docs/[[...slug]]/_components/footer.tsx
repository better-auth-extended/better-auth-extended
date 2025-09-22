import { Footer as NextPrevButtons } from "@/components/docs/page.client";
import { Feedback } from "@/components/feedback";
import { Footer } from "@/components/footer";
import { buttonVariants } from "@/components/ui/button";
import { onRateAction } from "@/lib/on-rate-action";
import { cn } from "@/lib/utils";
import { I18nLabel } from "fumadocs-ui/provider";
import { BookOpenTextIcon, EditIcon } from "lucide-react";
import Link from "next/link";
import { AnchorHTMLAttributes } from "react";

interface EditOnGitHubOptions
	extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> {
	owner: string;
	repo: string;

	/**
	 * SHA or ref (branch or tag) name.
	 *
	 * @defaultValue main
	 */
	sha?: string;

	/**
	 * File path in the repo
	 */
	path: string;
}

export const DocsFooter = (props: { editOnGithub: EditOnGitHubOptions }) => (
	<div className="mt-4">
		<NextPrevButtons />
		<Feedback onRateAction={onRateAction}>
			<div className="ms-auto flex flex-row items-center flex-wrap gap-4">
				<Link
					href="/llms.txt"
					target="_blank"
					rel="noreferrer noopener"
					className={buttonVariants({
						variant: "secondary",
						className: "text-muted-foreground!",
					})}
				>
					<BookOpenTextIcon aria-hidden="true" />
					llms.txt
				</Link>
				{props.editOnGithub ? <EditOnGitHub {...props.editOnGithub} /> : null}
			</div>
		</Feedback>
		<Footer variant="docs" />
	</div>
);
DocsFooter.displayName = "DocsFooter";

function EditOnGitHub({
	owner,
	repo,
	sha,
	path,
	...props
}: EditOnGitHubOptions) {
	const href = `https://github.com/${owner}/${repo}/blob/${sha}/${path.startsWith("/") ? path.slice(1) : path}`;

	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer noopener"
			{...props}
			className={cn(
				buttonVariants({
					variant: "secondary",
					className: "gap-1.5 text-fd-muted-foreground",
				}),
				props.className,
			)}
		>
			<EditIcon className="size-3.5" />
			<I18nLabel label="editOnGithub" />
		</a>
	);
}
