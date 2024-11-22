type InjectionTarget<T> = string | (new () => T);
// deno-lint-ignore no-explicit-any
const injectionTargets: Record<string, new () => any> = {};
// deno-lint-ignore no-explicit-any
const injectionTargetInstances: Record<string, any> = {};

// deno-lint-ignore no-explicit-any
export const Injectable = (token?: string) => (constructor: new () => any) => {
  injectionTargets[token ?? constructor.name] = constructor;
};

export function inject<T>(target: InjectionTarget<T>): T {
  const token =
    typeof target === typeof ""
      ? target.toString()
      : (target as new () => T).name;
  if (!injectionTargets[token] && typeof target !== typeof "") {
    throw new Error("no injection target found for " + token);
  }
  if (!injectionTargetInstances[token]) {
    injectionTargetInstances[token] = new injectionTargets[token]();
  }
  return injectionTargetInstances[token] ?? null;
}

export function overwriteInjectionTarget<T>(
  target: InjectionTarget<T>,
  replace: T
) {
  const token =
    typeof target === typeof ""
      ? target.toString()
      : (target as new () => T).name;
  injectionTargetInstances[token] = replace;
}
