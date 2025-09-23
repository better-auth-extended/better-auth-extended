"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { buttonVariants } from "./ui/button";
import { cn, uri } from "@/lib/utils";

export type GithubUserProps = React.ComponentProps<"span"> & {
	user: string | string[];
	compact?: boolean;
};

const UserAvatar = ({
	user,
	className,
	compact,
}: {
	user: string;
	className?: string;
	compact: boolean | undefined;
}) => {
	return (
		<Avatar className={cn(compact ? "size-5" : "size-6", className)}>
			<AvatarImage src={getGithubUserImage(user, 128)} />
			<AvatarFallback
				className={cn("leading-none", compact ? "text-[11px]" : "text-xs")}
			>
				{user.charAt(0).toUpperCase()}
			</AvatarFallback>
		</Avatar>
	);
};
UserAvatar.displayName = "UserAvatar";

export const getGithubUserImage = (username: string, size?: number) => {
	return `https://github.com/${username}.png${size ? `?size=${size}` : ""}`;
};

export const GithubUser = ({
	user,
	compact,
	className,
	...props
}: GithubUserProps) => {
	const users = [...new Set(Array.isArray(user) ? user : [user])];
	return (
		<span
			className={cn(
				"align-middle inline-flex not-prose items-center",
				className,
			)}
			{...props}
		>
			{users.length > 1 && (
				<span className="flex -space-x-3 -mr-3">
					{users.slice(1).map((user) => {
						return (
							<Link
								key={user}
								href={`https://github.com/${user}`}
								tabIndex={-1}
								target="_blank"
								rel="noopener noreferrer"
							>
								<UserAvatar
									user={user}
									compact={compact}
									className="hover:z-10 focus-visible:z-10"
								/>
							</Link>
						);
					})}
				</span>
			)}
			<Link
				href={`https://github.com/${users[0]}`}
				className="inline-flex items-center gap-2 group no-underline"
				target="_blank"
				rel="noopener noreferrer"
			>
				<UserAvatar user={users[0]} compact={compact} />
				<span
					className={cn(
						"group-hover:underline group-focus-visible:underline",
						compact && "-mt-0.5 text-xs text-muted-foreground",
					)}
				>
					{users[0]}
				</span>
			</Link>{" "}
			{users.length > 1 && (
				<HoverCard>
					<HoverCardTrigger asChild>
						<button
							type="button"
							className={cn(
								"text-xs ml-1.5 cursor-pointer hover:underline focus-visible:underline",
								compact && "text-muted-foreground",
							)}
						>
							+{users.length - 1}
						</button>
					</HoverCardTrigger>
					<HoverCardContent
						align="start"
						side="right"
						sideOffset={8}
						className="p-1 w-[200px] flex flex-col"
					>
						{users.slice(1).map((user) => (
							<Link
								key={user}
								href={uri`https://github.com/${user}`}
								className={buttonVariants({
									size: "sm",
									variant: "ghost",
									className: "rounded-sm justify-start no-underline",
								})}
								target="_blank"
								rel="noopener noreferrer"
							>
								<UserAvatar user={user} compact={false} className="-ms-1.5" />
								{user}
							</Link>
						))}
					</HoverCardContent>
				</HoverCard>
			)}
		</span>
	);
};
GithubUser.displayName = "GithubUser";
