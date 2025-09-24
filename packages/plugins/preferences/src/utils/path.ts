export const toPath = (u?: string | URL) => {
	if (!u) return "";
	try {
		return new URL(u).pathname;
	} catch {
		const s = `${u}`;
		const q = s.indexOf("?");
		const h = s.indexOf("#");
		const end = Math.min(q === -1 ? s.length : q, h === -1 ? s.length : h);
		return s.slice(0, end);
	}
};
