"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Input } from "./ui/input";
import { CircleXIcon } from "lucide-react";

export const SearchInput = () => {
	const id = useId();
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const handleClearInput = () => {
		setInputValue("");
		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLocaleLowerCase() === "k") {
				e.preventDefault();
				inputRef.current?.focus();
			}
		};

		window.addEventListener("keydown", handleKeyDown, { capture: true });

		return () => {
			window.removeEventListener("keydown", handleKeyDown, { capture: true });
		};
	}, []);

	return (
		<div className="relative">
			<Input
				id={id}
				ref={inputRef}
				className="pe-9"
				placeholder="Search..."
				type="text"
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
			/>
			{inputValue ? (
				<button
					className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
					aria-label="Clear input"
					onClick={handleClearInput}
				>
					<CircleXIcon size={16} aria-hidden="true" />
				</button>
			) : (
				<div className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2">
					<kbd className="text-muted-foreground/70 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
						⌘K
					</kbd>
				</div>
			)}
		</div>
	);
};
SearchInput.displayName = "SearchInput";
