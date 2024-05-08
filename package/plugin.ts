import type { RsbuildPlugin, RuleSetRule } from "npm:@rsbuild/shared@^0.6.12";
import type { Config } from "npm:@svgr/core@^8.1.0";

export interface MassSvgRule {
  test: NonNullable<RuleSetRule["test"]>;
  svgDefaultExport: "component" | "url";
  issuer?: NonNullable<RuleSetRule["issuer"]>;
  options?: Config;
}

export interface PluginMassSvgOptions {
  rules: MassSvgRule[];
}

export function pluginMassSvg(options: PluginMassSvgOptions): RsbuildPlugin {
  return {
    name: "rsbuild-plugin-mass-svg",
    pre: ["rsbuild:svgr"],
    setup(api) {
      api.modifyBundlerChain((chain, { CHAIN_ID }) => {
        if (options.rules.length) {
          const rule = chain.module.rule(CHAIN_ID.RULE.SVG);
          const firstOneOf = rule.oneOfs.values()[0];

          for (const [index, config] of Object.entries(options.rules)) {
            const current = rule.oneOf(`mass-svgr-${index}`);
            current.test(config.test).before((firstOneOf as any).ruleName);
            if (config.issuer) {
              current.issuer(config.issuer);
            }
            if (config.svgDefaultExport === "url") {
              current.merge(rule.oneOf(CHAIN_ID.ONE_OF.SVG_ASSET).entries()).test(config.test);
            } else if (config.svgDefaultExport === "component") {
              const use = current.use("svgr");

              use.loader(require.resolve("./svgr-loader"));

              use.options({ exportType: "default", ...config.options });

              const jsRule = chain.module.rules.get(CHAIN_ID.RULE.JS);

              for (const jsUseId of [CHAIN_ID.USE.SWC, CHAIN_ID.USE.BABEL]) {
                const jsUse = jsRule.uses.get(jsUseId);

                if (!jsUse) {
                  continue;
                }

                current
                  .use(jsUseId)
                  .before("svgr")
                  .loader(jsUse.get("loader"))
                  .options(jsUse.get("options"));
                break;
              }
            }
          }
        }
      });
    },
  };
}
