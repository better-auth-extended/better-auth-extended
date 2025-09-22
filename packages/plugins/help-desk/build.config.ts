import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
	declaration: true,
	rollup: {
		emitCJS: true,
		dts: {
			respectExternal: true,
			compilerOptions: {
				preserveSymlinks: true,
			},
		},
	},
	outDir: "dist",
	clean: false,
	failOnWarn: false,
	externals: ["better-auth", "better-call", "@better-fetch/fetch"],
});
