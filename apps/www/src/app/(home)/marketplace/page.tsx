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
	return <Marketplace />;
}
