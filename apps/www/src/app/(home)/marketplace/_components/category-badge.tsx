import { Badge } from "@/components/ui/badge";
import { Categories, categories } from "~/categories";

export const CategoryBadge = ({
	category: categoryKey,
}: {
	category: Categories;
}) => {
	const category = categories[categoryKey];

	return (
		<Badge variant="secondary" className="rounded-sm">
			{category.icon && (
				<category.icon className="-ms-1 size-4 text-muted-foreground" />
			)}
			{category.name}
		</Badge>
	);
};
CategoryBadge.displayName = "CategoryBadge";
