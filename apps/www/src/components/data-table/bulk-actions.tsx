import { cn } from "@/lib/utils";
import { Table } from "@tanstack/react-table";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "../ui/button";
import { XIcon } from "lucide-react";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { AnimatePresence, motion } from "motion/react";

export type BulkActionsProps<TData> = {
	table: Table<TData>;
	entityName: string;
	children: React.ReactNode;
};

export const BulkActions = <TData,>({
	table,
	entityName,
	children,
}: BulkActionsProps<TData>) => {
	const id = useId();
	const selectedRows = table.getFilteredSelectedRowModel().rows;
	const selectedCount = selectedRows.length;
	const toolbarRef = useRef<HTMLDivElement>(null);
	const [announcement, setAnnouncement] = useState("");

	// Announce selection changes to screen readers
	useEffect(() => {
		if (selectedCount > 0) {
			const message = `${selectedCount} ${entityName}${selectedCount > 1 ? "s" : ""} selected. Bulk actions toolbar is available.`;
			setAnnouncement(message);

			// Clear announcement after a delay
			const timer = setTimeout(() => setAnnouncement(""), 3000);
			return () => clearTimeout(timer);
		}
	}, [selectedCount, entityName]);

	const handleClearSelection = () => {
		table.resetRowSelection();
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		const buttons = toolbarRef.current?.querySelectorAll("button");
		if (!buttons) return;

		const currentIndex = Array.from(buttons).findIndex(
			(button) => button === document.activeElement,
		);

		switch (event.key) {
			case "ArrowRight": {
				event.preventDefault();
				const nextIndex = (currentIndex + 1) % buttons.length;
				buttons[nextIndex]?.focus();
				break;
			}
			case "ArrowLeft": {
				event.preventDefault();
				const prevIndex =
					currentIndex === 0 ? buttons.length - 1 : currentIndex - 1;
				buttons[prevIndex]?.focus();
				break;
			}
			case "Home":
				event.preventDefault();
				buttons[0]?.focus();
				break;
			case "End":
				event.preventDefault();
				buttons[buttons.length - 1]?.focus();
				break;
			case "Escape": {
				// Check if the Escape key came from a dropdown trigger or content
				// We can't check dropdown state because Radix UI closes it before our handler runs
				const target = event.target as HTMLElement;
				const activeElement = document.activeElement as HTMLElement;

				// Check if the event target or currently focused element is a dropdown trigger
				const isFromDropdownTrigger =
					target?.getAttribute("data-slot") === "dropdown-menu-trigger" ||
					activeElement?.getAttribute("data-slot") ===
						"dropdown-menu-trigger" ||
					target?.closest('[data-slot="dropdown-menu-trigger"]') ||
					activeElement?.closest('[data-slot="dropdown-menu-trigger"]');

				// Check if the focused element is inside dropdown content (which is portaled)
				const isFromDropdownContent =
					activeElement?.closest('[data-slot="dropdown-menu-content"]') ||
					target?.closest('[data-slot="dropdown-menu-content"]');

				if (isFromDropdownTrigger || isFromDropdownContent) {
					// Escape was meant for the dropdown - don't clear selection
					return;
				}

				// Escape was meant for the toolbar - clear selection
				event.preventDefault();
				handleClearSelection();
				break;
			}
		}
	};

	return (
		<AnimatePresence>
			{selectedCount === 0 ? null : (
				<>
					<div
						aria-live="polite"
						aria-atomic="true"
						className="sr-only"
						role="status"
					>
						{announcement}
					</div>

					<motion.div
						ref={toolbarRef}
						role="toolbar"
						aria-label={`Bulk actions for ${selectedCount} selected ${entityName}${selectedCount > 1 ? "s" : ""}`}
						aria-describedby={`${id}-bulk-actions-description`}
						tabIndex={-1}
						onKeyDown={handleKeyDown}
						className={cn(
							"fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl",
							"focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none",
						)}
						initial="hidden"
						animate="visible"
						exit="hidden"
						variants={{
							hidden: {
								opacity: 0,
								scale: 0.9,
							},
							visible: {
								opacity: 1,
								scale: 1,
							},
						}}
						transition={{
							duration: 0.15,
							ease: "easeOut",
						}}
					>
						<div
							className={cn(
								"p-2 pl-2.5 shadow-lg",
								"rounded-xl border",
								"bg-background/95 supports-[backdrop-filter]:bg-background/75 backdrop-blur-lg",
								"flex items-center gap-x-2",
							)}
						>
							<Tooltip delayDuration={300}>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										size="icon"
										onClick={handleClearSelection}
										className="size-6 rounded-full"
										aria-label="Clear selection"
									>
										<XIcon className="size-3.5" />
										<span className="sr-only">Clear selection</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent
									side="top"
									showArrow
									className="px-2 py-1 text-xs"
								>
									Clear selection
									<kbd className="text-muted-foreground/70 ms-2 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
										ESC
									</kbd>
								</TooltipContent>
							</Tooltip>

							<div
								className="flex items-center gap-x-1 text-sm"
								id={`${id}-bulk-actions-description`}
							>
								<span>{selectedCount}</span>{" "}
								<span className="hidden sm:inline">
									{entityName}
									{selectedCount > 1 ? "s" : ""}
								</span>{" "}
								selected
							</div>

							<Separator
								className="h-5!"
								orientation="vertical"
								aria-hidden="true"
							/>

							{children}
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
};
BulkActions.displayName = "BulkActions";
