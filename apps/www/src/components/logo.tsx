"use client";

import { SVGProps } from "react";

export const Logo = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		{...props}
	>
		<path
			fill="currentColor"
			d="M9.667 18.6h4.666v-4.4H19V23H5v-8.8h4.667v4.4Z"
		/>
		<path
			fill="currentColor"
			d="M14.333 14.2H9.667V9.8H5V1h4.667v4.4h4.666V1H19v8.8h-4.667v4.4Z"
		/>
	</svg>
);
Logo.displayName = "Logo";
