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
import { Resource } from "~/resources";
import { CategoryBadge } from "./category-badge";
import { GithubUser } from "@/components/github-user";
import Link from "next/link";
import { addBookmarks, isHidden } from "./utils";
import { Badge } from "@/components/ui/badge";

// TODO: Add author
export const GridItem = ({ row }: { row: Row<Resource> }) => {
	const data = row.original;

	return (
		<Card>
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
		</Card>
	);
};
GridItem.displayName = "GridItem";
