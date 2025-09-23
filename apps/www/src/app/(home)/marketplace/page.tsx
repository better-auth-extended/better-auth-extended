import { buttonVariants } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Marketplace } from "./client";
import { createMetadata } from "@/lib/metadata";
import { owner, repo } from "@/lib/github";
import { Suspense } from "react";

// TODO: Update description
export const metadata = createMetadata({
	title: "Marketplace",
	description:
		"Ea aliquip pariatur nisi amet voluptate minim occaecat dolor est laboris.",
	openGraph: {
		url: "/marketplace",
	},
});

export default function MarketplacePage() {
	return (
		<>
			<div className="flex-1 font-sans p-8 pb-16 md:p-16 lg:pb-20 lg:p-20">
				<div className="flex flex-col gap-16 mx-auto max-w-7xl @container/content">
					<div className="flex flex-col gap-6">
						<div className="space-y-2">
							{/* <div className="mb-0.5 size-8 rounded-full border grid place-items-center">
								<BoxesIcon className="size-4 text-muted-foreground" />
							</div> */}
							<h1 className="text-3xl font-medium">Marketplace</h1>
							<p className="text-muted-foreground">
								Discover and share free open-source resources and plugins for
								Better Auth.
							</p>
						</div>
						<Suspense>
							<Marketplace />
						</Suspense>
					</div>
					<Card>
						<CardHeader className="flex flex-col md:flex-row justify-between md:items-center gap-6">
							<div className="space-y-2">
								<CardTitle className="text-2xl">
									Contribute to the Marketplace
								</CardTitle>
								<CardDescription className="text-base max-w-3xl">
									Got a free open-source project or resource related to Better
									Auth? Share it with the community! Open a PR and help expand
									this curated collection of tools, plugins, and resources.
								</CardDescription>
							</div>
							<Link
								href={`https://github.com/${owner}/${repo}/compare/main...my-branch?template=marketplace.md`}
								className={buttonVariants({
									className: "md:ms-auto",
								})}
								rel="noreferrer noopener"
								target="_blank"
							>
								<GitHubLogoIcon />
								Open a PR
								<ArrowRightIcon className="-mr-1" />
							</Link>
						</CardHeader>
					</Card>
				</div>
			</div>
		</>
	);
}
