import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import("next").NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	rewrites: async () => [
		{
			source: "/docs/:path*.mdx",
			destination: "/llms.txt/:path*",
		},
	],
	redirects: async () => [
		{
			source: "/docs",
			destination: "/docs/introduction",
			permanent: true,
		},
	],
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "github.com",
			},
			{
				protocol: "https",
				hostname: "img.shields.io",
			},
		],
	},
};

export default withMDX(nextConfig);
