import type { PlopTypes } from "@turbo/gen";
import pluginCfg from "./plugin/generator";

export const PACKAGE_PREFIX = "@better-auth-extended/" as const;

export default function generator(plop: PlopTypes.NodePlopAPI) {
	plop.setGenerator("plugin", pluginCfg);
}
