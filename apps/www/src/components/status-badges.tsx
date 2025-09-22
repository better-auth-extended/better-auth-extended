"use client";

import { useMounted } from "@/hooks/use-mounted";
import { useTheme } from "next-themes";
import Link from "next/link";

export const StatusBadges = ({ npmPackage }: { npmPackage: string }) => {
	const { resolvedTheme } = useTheme();
	const mounted = useMounted();
	const imgClass = `inline-block rounded-xs`;

	const themeStyles =
		resolvedTheme === "dark"
			? {
					labelColor: "262626",
					color: "404040",
				}
			: {
					labelColor: "d4d4d4",
					color: "e5e5e5",
				};
	const badgeStyle = `&style=flat-square&labelColor=${themeStyles.labelColor}&color=${themeStyles.color}`;

	if (!mounted) {
		return null;
	}

	return (
		<>
			<div className="flex items-center gap-1.5 not-prose">
				<Link href={`https://www.npmjs.com/package/${npmPackage}`}>
					<img
						className={imgClass}
						src={`https://img.shields.io/npm/v/${npmPackage}.svg?label=version${badgeStyle}`}
						alt="Version"
					/>
				</Link>
				<Link href={`https://www.npmjs.com/package/${npmPackage}`}>
					<img
						className={imgClass}
						src={`https://img.shields.io/npm/dm/${npmPackage}.svg?label=downloads${badgeStyle}`}
						alt="Downloads"
					/>
				</Link>
				<Link href={`https://www.npmjs.com/package/${npmPackage}`}>
					<img
						className={imgClass}
						src={`https://img.shields.io/bundlephobia/min/${npmPackage}.svg?label=size${badgeStyle}`}
						alt="Size"
					/>
				</Link>
				<Link href={`https://www.npmjs.com/package/${npmPackage}`}>
					<img
						className={imgClass}
						src={`https://img.shields.io/npm/l/${npmPackage}.svg?label=license${badgeStyle}`}
						alt="License"
					/>
				</Link>
			</div>
		</>
	);
};
