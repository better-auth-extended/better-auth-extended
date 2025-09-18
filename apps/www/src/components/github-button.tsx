import { SquareArrowOutUpRight } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

export const GithubButton = ({
	username,
	repository,
	sha = "main",
	path,
}: {
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
		>
			<Button variant="outline" className="cursor-pointer">
				<GitHubLogoIcon />
				Github
				<SquareArrowOutUpRight className="size-3" />
			</Button>
		</Link>
	);
};
