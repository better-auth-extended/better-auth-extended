"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	flexRender,
	Row as TanstackRow,
	type Column,
	type Table as TanstackTable,
} from "@tanstack/react-table";
import {
	ArrowLeftToLineIcon,
	ArrowRightToLineIcon,
	EllipsisIcon,
	PinOffIcon,
} from "lucide-react";
import { motion, useReducedMotion, Variants } from "motion/react";
import { CSSProperties } from "react";
import type { TResource } from "./columns";

const getPinningStyles = (column: Column<TResource>): CSSProperties => {
	const isPinned = column.getIsPinned();
	return {
		left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
		right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
		position: isPinned ? "sticky" : "relative",
		width: column.getSize(),
		zIndex: isPinned ? 1 : 0,
	};
};

export const TableView = ({ table }: { table: TanstackTable<TResource> }) => {
	const shouldReduceMotion = useReducedMotion();

	const variants = {
		hidden: {
			opacity: 0,
			y: 10,
		},
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				type: "spring",
				stiffness: 260,
				damping: 28,
				duration: 0.2,
			},
		},
	} satisfies Variants;

	return (
		<motion.div
			initial="hidden"
			whileInView="visible"
			exit="hidden"
			viewport={{ once: true, amount: 0.2 }}
			variants={!shouldReduceMotion ? variants : undefined}
			transition={{
				duration: 0.15,
			}}
			className="will-change-transform rounded-lg overflow-hidden border"
		>
			<Table
				className="min-w-full [&_td]:border-border [&_th]:border-border table-fixed border-separate border-spacing-0 [&_tfoot_td]:border-t [&_th]:border-b [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b"
				style={{
					width: table.getTotalSize(),
				}}
			>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id} className="bg-muted/50">
							{headerGroup.headers.map((header) => {
								const { column } = header;
								const isPinned = column.getIsPinned();
								const isLastLeftPinned =
									isPinned === "left" && column.getIsLastColumn("left");
								const isFirstRightPinned =
									isPinned === "right" && column.getIsFirstColumn("right");

								return (
									<TableHead
										key={header.id}
										className={
											"not-first:not-last:border-r [&[data-pinned][data-last-col]]:border-border data-pinned:bg-muted/90 relative h-10 truncate data-pinned:backdrop-blur-xs [&:not([data-pinned]):has(+[data-pinned])_div.cursor-col-resize:last-child]:opacity-0 [&[data-last-col=left]_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=right]:last-child_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=right][data-last-col=right]]:border-l"
										}
										colSpan={header.colSpan}
										style={{ ...getPinningStyles(column) }}
										data-pinned={isPinned || undefined}
										data-last-col={
											isLastLeftPinned
												? "left"
												: isFirstRightPinned
													? "right"
													: undefined
										}
									>
										<div className="flex items-center justify-between gap-2">
											<span className="truncate">
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
											</span>
											{/* Pin/Unpin column controls with enhanced accessibility */}
											{!header.isPlaceholder &&
												header.column.getCanPin() &&
												(header.column.getIsPinned() ? (
													<Button
														size="icon"
														variant="ghost"
														className="-mr-1 size-7 shadow-none"
														onClick={() => header.column.pin(false)}
														aria-label={`Unpin ${header.column.columnDef.header as string} column`}
														title={`Unpin ${header.column.columnDef.header as string} column`}
													>
														<PinOffIcon
															className="opacity-60"
															size={16}
															aria-hidden="true"
														/>
													</Button>
												) : (
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																size="icon"
																variant="ghost"
																className="-mr-1 size-7 shadow-none"
																aria-label={`Pin options for ${header.column.columnDef.header as string} column`}
																title={`Pin options for ${header.column.columnDef.header as string} column`}
															>
																<EllipsisIcon
																	className="opacity-60"
																	size={16}
																	aria-hidden="true"
																/>
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem
																onClick={() => header.column.pin("left")}
															>
																<ArrowLeftToLineIcon
																	size={16}
																	className="opacity-60"
																	aria-hidden="true"
																/>
																Stick to left
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() => header.column.pin("right")}
															>
																<ArrowRightToLineIcon
																	size={16}
																	className="opacity-60"
																	aria-hidden="true"
																/>
																Stick to right
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												))}
											{header.column.getCanResize() && (
												<div
													data-table-resize-handle
													{...{
														onDoubleClick: () => header.column.resetSize(),
														onMouseDown: header.getResizeHandler(),
														onTouchStart: header.getResizeHandler(),
														className:
															"absolute top-0 h-full w-4 cursor-col-resize user-select-none touch-none -right-2 z-10 flex justify-center before:absolute before:w-px before:inset-y-0 before:-translate-x-px",
													}}
												/>
											)}
										</div>
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows.map((row) => (
						<Row key={row.id} row={row} />
					))}
				</TableBody>
			</Table>
		</motion.div>
	);
};

const MotionRow = motion.create(TableRow);

const Row = ({ row }: { row: TanstackRow<TResource> }) => {
	const shouldReduceMotion = useReducedMotion();

	return (
		<MotionRow
			layout={!shouldReduceMotion}
			transition={{
				duration: 0.15,
			}}
			data-state={row.getIsSelected() && "selected"}
			className="cursor-pointer group/row"
			onClick={(e) => {
				if (!e.isPropagationStopped()) {
					window.open(row.original.url, "_blank", "noopener,noreferrer");
				}
			}}
		>
			{row.getVisibleCells().map((cell) => {
				const { column } = cell;
				const isPinned = column.getIsPinned();
				const isLastLeftPinned =
					isPinned === "left" && column.getIsLastColumn("left");
				const isFirstRightPinned =
					isPinned === "right" && column.getIsFirstColumn("right");

				return (
					<TableCell
						key={cell.id}
						className={
							"[&[data-pinned][data-last-col]]:border-border data-pinned:bg-background/90 truncate data-pinned:backdrop-blur-xs [&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=right][data-last-col=right]]:border-l"
						}
						style={{ ...getPinningStyles(column) }}
						data-pinned={isPinned || undefined}
						data-last-col={
							isLastLeftPinned
								? "left"
								: isFirstRightPinned
									? "right"
									: undefined
						}
					>
						{flexRender(cell.column.columnDef.cell, cell.getContext())}
					</TableCell>
				);
			})}
		</MotionRow>
	);
};
