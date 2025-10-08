import { Marketplace } from "./client";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
	title: "Marketplace",
	description:
		"Discover and share free open-source resources and plugins for Better Auth.",
	openGraph: {
		url: "/marketplace",
	},
});

export default function MarketplacePage() {
	return <Marketplace />;
}
