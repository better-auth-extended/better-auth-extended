import { Logo } from "./logo";
import { DotIcon } from "lucide-react";
import { cva, VariantProps } from "class-variance-authority";
import { Socials } from "./socials";

const footerVariants = cva("flex min-h-16 items-center w-full py-4", {
	variants: {
		variant: {
			default: "px-4 md:px-6 lg:px-8",
			docs: "",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export type FooterProps = Omit<React.ComponentProps<"footer">, "children"> &
	VariantProps<typeof footerVariants> & {
		hideSocials?: boolean;
	};

export const Footer = ({
	className,
	variant,
	hideSocials = false,
	...props
}: FooterProps) => {
	return (
		<footer
			className={footerVariants({
				variant,
				className,
			})}
			{...props}
		>
			<span className="flex items-center gap-1 text-muted-foreground text-sm">
				&copy; {new Date().getUTCFullYear()}
				<DotIcon className="size-4" />
				<a
					href="/"
					className="flex items-center gap-0.5 font-medium tracking-tight hover:text-foreground transition-colors"
				>
					<Logo className="size-4.5" /> better-auth-extended
				</a>
			</span>
			{!hideSocials && <Socials className="ms-auto" />}
		</footer>
	);
};
Footer.displayName = "Footer";
