import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Categories, categories } from "~/categories";

export const CategoryBadge = ({
	category: categoryKey,
	className,
	...props
}: {
	category: Categories;
} & React.ComponentProps<"span">) => {
	const category = categories[categoryKey];

	return (
		<Badge
			variant="secondary"
			className={cn("rounded-sm", className)}
			{...props}
		>
			{category.icon && (
				<category.icon className="-ms-1 size-4 text-muted-foreground" />
			)}
			{category.name}
		</Badge>
	);
};
CategoryBadge.displayName = "CategoryBadge";
