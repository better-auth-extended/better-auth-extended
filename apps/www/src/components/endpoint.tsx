"use client";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

function Method({ method }: { method: "POST" | "GET" | "DELETE" | "PUT" }) {
	return (
		<Badge
			variant="outline"
			className={
				{
					POST: "text-amber-500",
					GET: "text-emerald-500",
					DELETE: "text-red-500",
					PUT: "text-indigo-500",
				}[method]
			}
		>
			{method}
		</Badge>
	);
}

export function Endpoint({
	path,
	method,
	isServerOnly,
	className,
}: {
	path: string;
	method: "POST" | "GET" | "DELETE" | "PUT";
	isServerOnly?: boolean;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"relative flex items-center w-full gap-2 p-2 border-t border-x border-border bg-fd-secondary/50 group rounded-t-lg",
				className,
			)}
		>
			<Method method={method} />
			<span className="font-mono text-sm text-muted-foreground">{path}</span>
		</div>
	);
}
