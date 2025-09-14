export const PACKAGE_PREFIX = "@better-auth-extended/" as const;

export const sanitizeName = (
	answers: Record<string, any>,
	options?: {
		key?: string;
		prefix?: string;
	},
) => {
	const { key = "name", prefix = PACKAGE_PREFIX } = options ?? {};
	if (
		key in answers &&
		typeof answers[key] === "string" &&
		answers[key].startsWith(prefix)
	) {
		answers[key] = answers[key].substring(prefix.length);
	}
};
