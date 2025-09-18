"use client";

import { SVGProps } from "react";

export const Logo = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={"1em"}
		height={"1em"}
		viewBox="0 0 300 500"
		fill="none"
		{...props}
	>
		<path
			fill="currentColor"
			d="M100 400h100V300h100v200H0V300h100v100ZM200 300H100V200H0V0h100v100h100V0h100v200H200v100Z"
		/>
	</svg>
);
Logo.displayName = "Logo";
