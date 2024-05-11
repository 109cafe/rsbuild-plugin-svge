import type { RsbuildPlugin, RuleSetRule } from "@rsbuild/shared";
import type { Config as SvgrConfig } from "@svgr/core";
import { mergeRule } from "./utils";

export type MassSvgRule = Pick<
  RuleSetRule,
  | "test"
  | "issuer"
  | "include"
  | "exclude"
  | "resourceQuery"
  | "dependency"
  | "mimetype"
  | "generator"
  | "parser"
> &
  (
    | { defaultExport: "asset" | "asset/inline" | "asset/resource"; svgr?: never }
    | { defaultExport: "component"; svgr?: Omit<SvgrConfig, "exportType"> }
  );

export interface PluginMassSvgOptions {
  rules: MassSvgRule[];
}

export const PLUGIN_CHAIN_ID = {
  ONE_OF: {
    MASS_SVG_PREFIX: "mass-svg-",
  },
};

export function pluginMassSvg({ rules }: PluginMassSvgOptions): RsbuildPlugin {
  return {
    name: "rsbuild-plugin-mass-svg",
    pre: ["rsbuild:svgr"],
    setup(api) {
      if (!rules?.length) return;
      api.modifyBundlerChain((chain, { CHAIN_ID }) => {
        const rbSvgRule = chain.module.rule(CHAIN_ID.RULE.SVG);
        const firstOneOfRuleName = (rbSvgRule.oneOfs.values()[0] as any)?.ruleName;

        for (const [index, { defaultExport, svgr, ...ruleOptions }] of Object.entries(rules)) {
          const current = rbSvgRule.oneOf(`${PLUGIN_CHAIN_ID.ONE_OF.MASS_SVG_PREFIX}${index}`);

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
              return { ...options, ...svgr, exportType: "default", foo: 123 };
            });
          }
          current.merge(ruleOptions);
        }
      });
    },
  };
}
