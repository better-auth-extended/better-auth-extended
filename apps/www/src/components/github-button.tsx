import { SquareArrowOutUpRight } from "lucide-react";
import { buttonVariants } from "./ui/button";
import Link from "next/link";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

export const GithubButton = ({
	username,
	repository,
	sha = "main",
	path,
	label = "GitHub",
}: {
	label?: string;
	username: string;
	repository: string;
	sha?: string;
	path?: string;
}) => {
	return (
		<Link
			href={`https://github.com/${username}/${repository}/tree/${sha}${path ? (path?.startsWith("/") ? path : `/${path}`) : ""}`}
			target="_blank"
			rel="noopener noreferrer"
			className={buttonVariants({
				variant: "secondary",
				size: "sm",
			})}
		>
			<GitHubLogoIcon />
			{label}
			<SquareArrowOutUpRight className="size-3.5 text-muted-foreground" />
		</Link>
	);
};
