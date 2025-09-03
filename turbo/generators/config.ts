import type { PlopTypes } from "@turbo/gen";
import pluginCfg from "./plugin/config";

export default function generator(plop: PlopTypes.NodePlopAPI) {
	plop.setGenerator("plugin", pluginCfg);
}
