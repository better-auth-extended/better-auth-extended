import { buttonVariants } from "./ui/button";
import Link from "next/link";
import { SquareArrowOutUpRight } from "lucide-react";

export const NpmButton = ({ packageName }: { packageName: string }) => {
	return (
		<Link
			href={`https://www.npmjs.com/package/${packageName}`}
			target="_blank"
			rel="noopener noreferrer"
			className={buttonVariants({
				variant: "secondary",
				size: "sm",
			})}
		>
			<svg
				className="fill-foreground"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g>
					<g>
						<rect width="24" height="24" opacity="0" />
						<path d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h7V11h4v10h1a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z" />
					</g>
				</g>
			</svg>
			NPM
			<SquareArrowOutUpRight className="size-3.5 text-muted-foreground" />
		</Link>
	);
};
NpmButton.displayName = "NpmButton";
