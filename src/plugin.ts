import type { RsbuildPlugin, RuleSetRule } from "@rsbuild/shared";
import { mergeRule } from "./utils";

export interface MassSvgRule
  extends Pick<
    RuleSetRule,
    | "test"
    | "issuer"
    | "include"
    | "exclude"
    | "resourceQuery"
    | "dependency"
    | "mimetype"
    | "generator"
  > {
  defaultExport: "component" | "asset" | "asset/inline" | "asset/resource";
}

export interface PluginMassSvgOptions {
  rules: MassSvgRule[];
}

export function pluginMassSvg({ rules }: PluginMassSvgOptions): RsbuildPlugin {
  return {
    name: "rsbuild-plugin-mass-svg",
    pre: ["rsbuild:svgr"],
    setup(api) {
      if (!rules?.length) return;
      api.modifyBundlerChain((chain, { CHAIN_ID }) => {
        const rbSvgRule = chain.module.rule(CHAIN_ID.RULE.SVG);
        const firstOneOfRuleName = (rbSvgRule.oneOfs.values()[0] as any)?.ruleName;

        for (const [index, { defaultExport, ...ruleOptions }] of Object.entries(rules)) {
          const current = rbSvgRule.oneOf(`mass-svg-${index}`);

          if (firstOneOfRuleName) {
            current.before(firstOneOfRuleName);
          }

          if (defaultExport === "asset") {
            mergeRule(current, rbSvgRule.oneOf(CHAIN_ID.ONE_OF.SVG_ASSET)).delete("resourceQuery");
          } else if (defaultExport === "asset/inline") {
            mergeRule(current, rbSvgRule.oneOf(CHAIN_ID.ONE_OF.SVG_INLINE)).delete("resourceQuery");
          } else if (defaultExport === "asset/resource") {
            mergeRule(current, rbSvgRule.oneOf(CHAIN_ID.ONE_OF.SVG_URL)).delete("resourceQuery");
          } else if (defaultExport === "component") {
            mergeRule(current, rbSvgRule.oneOf(CHAIN_ID.ONE_OF.SVG_REACT)).delete("resourceQuery");

            current.use(CHAIN_ID.USE.SVGR).tap((options) => {
              return { ...options, exportType: "default" };
            });
          }
          current.merge(ruleOptions);
        }
      });
    },
  };
}
