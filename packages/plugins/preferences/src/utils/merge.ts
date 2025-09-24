const isObject = (value: any): boolean => {
	return value !== null && typeof value === "object" && !Array.isArray(value);
};

const isArray = (value: any): boolean => {
	return Array.isArray(value);
};

const uniqueArray = (value: any[]) => {
	return Array.from(
		new Map(value.map((item) => [JSON.stringify(item), item])).values(),
	);
};

export const merge = <T>(
	target: T,
	defaults: T,
	strategy: "deep" | "replace" = "deep",
): T => {
	if (strategy === "replace" || (!isArray(target) && !isObject(target))) {
		return target ?? defaults;
	}

	if (isArray(target) && isArray(defaults)) {
		return uniqueArray(
			// @ts-expect-error
			[...target, ...defaults],
		) as T;
	}

	const result: any = isObject(defaults)
		? { ...defaults }
		: isArray(defaults)
			? [...(defaults as any)]
			: (defaults ?? {});

	for (const key of Object.keys(target as any)) {
		if (target && typeof target === "object" && key in target) {
			const targetValue: any = (target as any)[key];
			const defaultValue: any = (defaults as any)[key];

			if (isObject(targetValue) && isObject(defaultValue)) {
				result[key] = merge(targetValue, defaultValue, strategy);
			} else if (isArray(targetValue) && isArray(defaultValue)) {
				result[key] = uniqueArray([...targetValue, ...defaultValue]);
			} else {
				result[key] = targetValue ?? defaultValue;
			}
		}
	}

	return result;
};
