// deno-lint-ignore no-explicit-any
const injectionTargets: Record<string, new () => any> = {};
// deno-lint-ignore no-explicit-any
const injectionTargetInstances: Record<string, any> = {};

// deno-lint-ignore no-explicit-any
export const Injectable = (token?: string) => (constructor: new () => any) => {
  injectionTargets[token ?? constructor.name] = constructor;
};

export function inject<T>(target: string | (new () => T)): T | null {
  const token = typeof target === typeof '' ? target.toString() : (target as new () => T).name;
  if (!injectionTargets[token]) {
    return null;
  }
  if (!injectionTargetInstances[token]) {
    injectionTargetInstances[token] = new injectionTargets[token]();
  }
  return injectionTargetInstances[token] ?? null;
}