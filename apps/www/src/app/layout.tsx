import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { RootProvider } from "fumadocs-ui/provider";
import { CustomSearchDialog } from "@/components/search-dialog";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { baseUrl, createMetadata } from "@/lib/metadata";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata = createMetadata({
	title: {
		template: "%s | better-auth-extended",
		default: "better-auth-extended",
	},
	description:
		"A curated set of plugins, tools, and libraries for Better-Auth.",
	metadataBase: baseUrl,
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-dvh bg-surface`}
			>
				<NuqsAdapter>
					<RootProvider
						search={{
							enabled: true,
							SearchDialog: CustomSearchDialog,
						}}
					>
						<ThemeProvider
							attribute="class"
							defaultTheme="system"
							enableSystem
							disableTransitionOnChange
						>
							<Navbar />

							{children}
						</ThemeProvider>
					</RootProvider>
				</NuqsAdapter>
			</body>
		</html>
	);
}
