import type { PlopTypes } from "@turbo/gen";
import pluginCfg from "./plugin/generator";
import packageCfg from "./package/generator";

export default function generator(plop: PlopTypes.NodePlopAPI) {
	plop.setGenerator("plugin", pluginCfg);
	plop.setGenerator("package", packageCfg);
}
