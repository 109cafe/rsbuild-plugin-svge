import type { WebpackChain } from "@rsbuild/shared";

export function mergeRule<T>(
  to: WebpackChain.Rule<T>,
  from: WebpackChain.Rule<T>
): WebpackChain.Rule<T> {
  to.merge(from.entries());

  for (const _use of from.uses.values()) {
    const use = _use as unknown as (typeof _use)[0] & { name: string };
    to.use(use.name)
      .loader(use.get("loader"))
      .options({ ...use.get("options") });
  }
  return to;
}
