export interface IController {
  initialize(): void;
}

const controllers: Record<string, new () => IController> = {};

export const Controller = (pagePath: string) => {
  return (constructor: new () => IController) => {
    controllers[pagePath] = constructor;
  };
};

export function getController(path: string) {
  return controllers[path] ?? null;
}
