import { cn } from "@/lib/utils";
import { createContext, useContext, useState } from "react";

export const BentoGrid = ({
	className,
	children,
	...props
}: React.ComponentProps<"div">) => {
	return (
		<div
			className={cn(
				"grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-3",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
};
BentoGrid.displayName = "BentoGrid";

export type BentoGridItemState = {
	hovering: boolean;
	setHovering: React.Dispatch<React.SetStateAction<boolean>>;
};

const BentoGridItemContext = createContext<BentoGridItemState | null>(null);
export function useBentoGridItem() {
	const ctx = useContext(BentoGridItemContext);
	if (!ctx) throw new Error("Missing <BentoGridItem />");
	return ctx;
}

export const BentoGridItem = ({
	children,
	className,
	onClick,
	onKeyDown,
	onMouseEnter,
	onMouseLeave,
	...props
}: React.ComponentProps<"div"> & {
	onClick?: React.EventHandler<React.SyntheticEvent<HTMLDivElement>>;
	children?: React.ReactNode | ((ctx: BentoGridItemState) => React.ReactNode);
}) => {
	const [hovering, setHovering] = useState(false);

	return (
		<BentoGridItemContext.Provider
			value={{
				hovering,
				setHovering,
			}}
		>
			<div
				className={cn(
					"cursor-pointer row-span-1 overflow-hidden rounded-xl group/bento transition duration-200 shadow-input dark:shadow-none p-4 border border-border/60 hover:border-border/90 dark:border-border/40 dark:hover:border-border/70 justify-between flex flex-col space-y-4",
					"outline-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
					className,
				)}
				role="button"
				tabIndex={0}
				onClick={onClick}
				onMouseEnter={(e) => {
					setHovering(true);
					onMouseEnter?.(e);
				}}
				onMouseLeave={(e) => {
					setHovering(false);
					onMouseLeave?.(e);
				}}
				onKeyDown={(e) => {
					if (!e.defaultPrevented && e.key === "Enter") {
						onClick?.(e);
					}
				}}
				{...props}
			>
				{children}
			</div>
		</BentoGridItemContext.Provider>
	);
};
BentoGridItem.displayName = "BentoGridItem";

export const BentoGridItemTitle = ({
	children,
	className,
	icon: Icon,
	...props
}: React.ComponentProps<"div"> & {
	icon?: React.ComponentType<{ className?: string }>;
}) => {
	return (
		<div
			className={cn(
				"font-sans font-bold my-2 flex items-center gap-1.5",
				className,
			)}
			{...props}
		>
			{Icon && (
				<Icon
					className="inline size-4 text-muted-foreground group-hover/bento:text-foreground group-focus-visible/bento:text-foreground transition-colors"
					aria-hidden="true"
				/>
			)}
			{children}
		</div>
	);
};
BentoGridItemTitle.displayName = "BentoGridItemTitle";

export const BentoGridItemDescription = ({
	children,
	className,
	...props
}: React.ComponentProps<"div">) => {
	return (
		<div
			className={cn(
				"font-sans font-normal text-muted-foreground text-xs",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
};
BentoGridItemDescription.displayName = "BentoGridItemDescription";
