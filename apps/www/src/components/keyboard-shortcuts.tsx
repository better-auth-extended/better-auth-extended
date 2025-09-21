"use client";

import { useEffect, useState } from "react";

export const MetaOrControl = () => {
	const [key, setKey] = useState("⌘");

	useEffect(() => {
		const isWindows = window.navigator.userAgent.includes("Windows");

		if (isWindows) setKey("Ctrl");
	}, []);

	return key;
};
MetaOrControl.displayName = "MetaOrControl";
