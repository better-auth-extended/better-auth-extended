import defaultMdxComponents from "fumadocs-ui/mdx";
import { MDXComponents } from "mdx/types";
import {
	CodeBlock,
	CodeBlockTab,
	CodeBlockTabs,
	CodeBlockTabsList,
	Pre,
} from "./ui/code-block";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { TypeTable } from "fumadocs-ui/components/type-table";
import { File, Folder, Files } from "fumadocs-ui/components/files";
import { AutoTypeTable } from "fumadocs-typescript/ui";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { Callout } from "./ui/callout";
import { Endpoint } from "./endpoint";
import { APIMethod } from "./api-method";
import { DividerText } from "./divider-text";
import { ForkButton } from "./fork-button";
import DatabaseTable from "./database-table";
import { StatusBadges } from "./status-badges";
import { NpmButton } from "./npm-button";
import { GithubButton } from "./github-button";

export const getMDXComponents = (components?: MDXComponents): MDXComponents => {
	return {
		...defaultMdxComponents,
		CodeBlockTabs: (props) => {
			return (
				<CodeBlockTabs
					{...props}
					className="p-0 border-0 rounded-lg bg-fd-secondary"
				>
					<div>{props.children}</div>
				</CodeBlockTabs>
			);
		},
		CodeBlockTabsList: (props) => {
			return (
				<CodeBlockTabsList
					{...props}
					className="pb-0 my-0 rounded-lg bg-fd-secondary"
				/>
			);
		},
		CodeBlockTab: (props) => {
			return <CodeBlockTab {...props} className="p-0 m-0 rounded-lg" />;
		},
		pre: (props) => {
			return (
				<CodeBlock className="rounded-xl bg-fd-muted" {...props}>
					<div style={{ minWidth: "100%", display: "table" }}>
						<Pre className="px-0 py-3 bg-fd-muted focus-visible:outline-none">
							{props.children}
						</Pre>
					</div>
				</CodeBlock>
			);
		},
		Link: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
			<Link
				className={cn("font-medium underline underline-offset-4", className)}
				{...props}
			/>
		),
		Step,
		Steps,
		File,
		Folder,
		Files,
		Tab,
		Tabs,
		AutoTypeTable,
		TypeTable,
		ForkButton,
		DatabaseTable,
		Accordion,
		Accordions,
		Endpoint,
		APIMethod,
		Callout: ({
			children,
			type,
			...props
		}: {
			children: React.ReactNode;
			type?: "info" | "warn" | "error" | "success" | "warning";
			[key: string]: any;
		}) => (
			<Callout type={type} {...props}>
				{children}
			</Callout>
		),
		DividerText,
		StatusBadges,
		NpmButton,
		GithubButton,
		iframe: (props) => <iframe {...props} className="w-full h-[500px]" />,
		...components,
	};
};
