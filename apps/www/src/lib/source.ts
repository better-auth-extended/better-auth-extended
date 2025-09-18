import { docs } from "@/.source";
import { getPageTree } from "@/components/sidebar-content";
import { loader } from "fumadocs-core/source";

export let source = loader({
	baseUrl: "/docs",
	source: docs.toFumadocsSource(),
});

source = { ...source, pageTree: getPageTree() };
