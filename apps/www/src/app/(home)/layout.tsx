"use client";

import ReactLenis, { LenisRef } from "lenis/react";
import { cancelFrame, frame } from "motion/react";
import { useEffect, useRef } from "react";
import "lenis/dist/lenis.css";

export default function HomeLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const lenisRef = useRef<LenisRef>(null);

	useEffect(() => {
		const target = document.body || document.documentElement;

		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (
					mutation.type === "attributes" &&
					mutation.attributeName === "style"
				) {
					if (
						target.computedStyleMap().get("overflow")?.toString() &&
						!lenisRef.current?.lenis?.isStopped
					) {
						lenisRef.current?.lenis?.stop();
					} else if (lenisRef.current?.lenis?.isStopped) {
						lenisRef.current?.lenis?.start();
					}
				}
			}
		});

		observer.observe(target, {
			attributes: true,
			attributeFilter: ["style"],
		});

		const update = (data: { timestamp: number }) => {
			const time = data.timestamp;
			lenisRef.current?.lenis?.raf(time);
		};

		frame.update(update, true);

		return () => {
			cancelFrame(update);
			observer.disconnect();
		};
	}, []);

	return (
		<>
			<ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />
			{children}
		</>
	);
}
