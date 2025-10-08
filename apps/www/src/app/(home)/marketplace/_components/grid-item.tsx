"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { Row } from "@tanstack/react-table";
import { BookmarkIcon, CalendarIcon, ExternalLinkIcon } from "lucide-react";
import { CategoryBadge } from "./category-badge";
import { GithubUser } from "@/components/github-user";
import Link from "next/link";
import { addBookmarks, isHidden } from "./utils";
import { Badge } from "@/components/ui/badge";
import { motion, useReducedMotion, Variants } from "motion/react";
import { TResource } from "./columns";

const MotionCard = motion.create(Card);

export const GridItem = ({ row }: { row: Row<TResource> }) => {
	const data = row.original;

	const shouldReduceMotion = useReducedMotion();

	const variants = {
		hidden: {
			opacity: 0,
			y: 10,
		},
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				type: "spring",
				stiffness: 260,
				damping: 28,
				duration: 0.2,
			},
		},
	} satisfies Variants;

	return (
		<MotionCard
			key={row.id}
			layout={!shouldReduceMotion}
			initial="hidden"
			whileInView="visible"
			exit="hidden"
			viewport={{ once: true, amount: 0.2 }}
			variants={!shouldReduceMotion ? variants : undefined}
			transition={{
				duration: 0.15,
			}}
			className="will-change-transform"
		>
			<CardHeader className="space-y-2">
				<div className="flex items-center">
					<CardTitle>
						{data.name}
						{data.isNew && (
							<Badge
								variant="outline"
								className="ml-2 border-dashed border-input"
								aria-hidden="true"
							>
								New
							</Badge>
						)}
					</CardTitle>
					{!isHidden(row, "category") && (
						<CategoryBadge className="ms-auto" category={data.category} />
					)}
				</div>
				<CardDescription
					className={isHidden(row, "description") ? "sr-only" : ""}
				>
					{data.description}
				</CardDescription>
			</CardHeader>
			<CardFooter className="mt-auto">
				<div className="flex w-full flex-col gap-3">
					<div className="flex items-center">
						{data.dateAdded && !isHidden(row, "dateAdded") && (
							<div className="flex items-center gap-1.5 text-muted-foreground">
								<CalendarIcon className="size-3" aria-hidden="true" />
								<p className="text-xs">
									{data.dateAdded.toISOString().split("T")[0]}
								</p>
							</div>
						)}
						{data.author && !isHidden(row, "author") && (
							<GithubUser className="ms-auto" user={data.author} compact />
						)}
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							className="size-8"
							onClick={() => {
								addBookmarks(data.name);
							}}
						>
							<BookmarkIcon
								className={
									!!row.getValue("bookmarked")
										? "text-amber-500 fill-current"
										: ""
								}
							/>
							<span className="sr-only">Bookmark</span>
						</Button>
						<Link
							href={data.url}
							className={buttonVariants({
								variant: "outline",
								size: "sm",
								className: "grow cursor-default",
							})}
							target="_blank"
							rel="noopener noreferrer"
						>
							View Resource
							<ExternalLinkIcon />
						</Link>
					</div>
				</div>
			</CardFooter>
		</MotionCard>
	);
};
GridItem.displayName = "GridItem";
