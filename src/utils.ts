import type { WebpackChain } from "@rsbuild/shared";

export function mergeRule<T>(
  to: WebpackChain.Rule<T>,
  from: WebpackChain.Rule<T>
): WebpackChain.Rule<T> {
  to.merge(from.entries());
  const uses = from.uses.entries();
  if (uses) {
    to.uses.merge(uses);
  }
  return to;
}
