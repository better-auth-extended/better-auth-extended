import { useEffect, useState } from "react";

export function useCssSupports(conditionText: string): boolean;
export function useCssSupports(property: string, value: string): boolean;
export function useCssSupports(property: string, val?: string) {
	const [value, setValue] = useState(false);

	useEffect(() => {
		setValue(window.CSS.supports(property, val!));
	}, [property, val]);

	return value;
}
