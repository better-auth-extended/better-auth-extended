import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Row } from "@tanstack/react-table";
import { BookmarkIcon, CalendarIcon, ExternalLinkIcon } from "lucide-react";
import { Resource } from "~/resources";
import { CategoryBadge } from "./category-badge";
import { GithubUser } from "@/components/github-user";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { addBookmarks } from "./utils";

export const ListItem = ({ row }: { row: Row<Resource> }) => {
	const data = row.original;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
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
					<CategoryBadge category={data.category} />
				</div>
				<CardDescription>{data.description}</CardDescription>
			</CardHeader>
			<CardFooter className="mt-auto">
				<div className="flex w-full flex-col gap-2">
					<div className="flex gap-2 items-end justify-between">
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
									className: "cursor-default",
								})}
								target="_blank"
								rel="noopener noreferrer"
							>
								View Resource
								<ExternalLinkIcon />
							</Link>
						</div>
						<div className="flex flex-col justify-end items-end gap-1.5">
							<div className="flex items-center gap-1.5 text-muted-foreground">
								<CalendarIcon className="size-3" aria-hidden="true" />
								<p className="text-xs">
									{data.dateAdded.toISOString().split("T")[0]}
								</p>
							</div>
							{data.author && <GithubUser user={data.author} compact />}
						</div>
					</div>
				</div>
			</CardFooter>
		</Card>
	);
};
