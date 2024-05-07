import { PartialBaseBuildConfig, defineConfig, moduleTools } from "@modern-js/module-tools";

const base: PartialBaseBuildConfig = {
  buildType: "bundleless",
  outDir: "dist",
  target: "es2020",
  platform: "node",
};
export default defineConfig({
  plugins: [moduleTools()],
  buildConfig: [
    {
      ...base,
      format: "cjs",
      dts: { respectExternal: false },
      esbuildOptions(options) {
        options.outExtension = {
          ...options.outExtension,
          ".js": ".cjs",
        };
        return options;
      },
    },

    // {
    //   ...base,
    //   format: 'esm',
    //   dts: false,
    //   esbuildOptions(options) {
    //     options.outExtension = {
    //       ...options.outExtension,
    //       ".js": ".mjs",
    //     };
    //     return options;
    //   },
    // },
  ],
});
