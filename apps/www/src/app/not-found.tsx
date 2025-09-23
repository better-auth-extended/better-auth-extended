"use client";

import { Footer } from "@/components/footer";
import { Logo } from "@/components/logo";
import { Navbar } from "@/components/navbar";
import { buttonVariants } from "@/components/ui/button";
import { Plasma } from "@/components/ui/plasma";
import { useMounted } from "@/hooks/use-mounted";
import { ArrowLeftIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

export default function NotFound() {
	const { resolvedTheme } = useTheme();
	const mounted = useMounted();

	return (
		<>
			<Navbar forceIsDocs={false} />
			<div className="z-[2] flex-1 h-full relative overflow-hidden flex flex-col">
				<div className="flex-1 flex flex-col items-center justify-center">
					<div className="text-center pointer-events-none">
						<Logo className="size-8 mb-4 mx-auto" />
						<p className="font-semibold text-muted-foreground">404</p>
						<h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance sm:text-7xl">
							Page not found
						</h1>
						<p className="mt-6 text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8">
							Sorry, we couldn't find the page you're looking for.
						</p>
						<div className="flex flex-col gap-4 mt-10 pointer-events-auto">
							<div className="flex items-center justify-center gap-x-6">
								<Link
									href="/docs"
									rel="noreferrer noopener"
									className={buttonVariants({
										size: "lg",
									})}
								>
									Documentation
								</Link>
								<Link
									href="/marketplace"
									rel="noreferrer noopener"
									className={buttonVariants({
										size: "lg",
										variant: "secondary",
									})}
								>
									Marketplace
								</Link>
							</div>
							<Link
								href="/"
								rel="noreferrer noopener"
								className={buttonVariants({
									size: "lg",
									variant: "link",
								})}
							>
								<ArrowLeftIcon aria-hidden="true" />
								Go back home
							</Link>
						</div>
					</div>
				</div>
				<Footer className="mt-auto" />
				<div className="absolute inset-0 -z-[1]">
					{mounted && (
						<Plasma
							color={resolvedTheme === "dark" ? "#525252" : "#fbfbfb"}
							speed={0.4}
							direction="forward"
							scale={1.1}
							opacity={0.8}
							mouseInteractive={true}
							mouseInteractionMultiplier={0.35}
							mouseTarget="window"
						/>
					)}
				</div>
			</div>
		</>
	);
}
