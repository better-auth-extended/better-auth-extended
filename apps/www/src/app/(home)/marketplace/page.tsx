import { buttonVariants } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { Logo } from "@/components/logo";
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

// TODO: Update description
export const metadata = createMetadata({
	title: "Marketplace",
	description:
		"Ea aliquip pariatur nisi amet voluptate minim occaecat dolor est laboris.",
});

export default function Home() {
	return (
		<>
			<div className="font-sans p-8 pb-20 sm:p-20">
				<div className="flex flex-col gap-16 mx-auto max-w-7xl @container/content">
					<div className="flex flex-col gap-6">
						<div className="space-y-2">
							<div className="space-y-0.5">
								<div className="text-muted-foreground flex items-center gap-0.5 text-xs">
									<Logo className="h-3.5" />
									<span>better-auth-extended</span>
								</div>
								<h1 className="text-3xl font-medium">Marketplace</h1>
							</div>
							<p className="text-muted-foreground">
								Minim consequat id aute voluptate nostrud.
							</p>
						</div>
						<Marketplace />
					</div>
					<Card>
						<CardHeader className="flex flex-row items-center gap-6">
							<div className="space-y-2">
								<CardTitle className="text-2xl">Help grow this list</CardTitle>
								<CardDescription className="text-base max-w-3xl">
									Have an awesome Better Auth related project or resource? Share
									it with the community! Open a PR and help grow this curated
									list.
								</CardDescription>
							</div>
							<Link
								href="/"
								className={buttonVariants({
									className: "ms-auto",
								})}
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
