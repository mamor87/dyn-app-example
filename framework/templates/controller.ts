export interface IControllerInit {
  initialize(): void;
}

// deno-lint-ignore no-explicit-any
const controllers: Record<string, new () => any> = {};
// deno-lint-ignore no-explicit-any
const controllerInstances: Record<string, any> = {};

export const Controller = (pagePath: string) => {
  // deno-lint-ignore no-explicit-any
  return (constructor: new () => any) => {
    controllers[pagePath] = constructor;
  };
};

export function getController(
  path: string,
  browserId: string,
  sessionTime: number
) {
  cleanControllerInstances();
  if (!controllers[path]) {
    return null;
  }
  const instanceKey = `${path}#${browserId}`;
  if (!controllerInstances[instanceKey]) {
    controllerInstances[instanceKey] = new controllers[path]();
    if (typeof controllerInstances[instanceKey].initialize === "function") {
      controllerInstances[instanceKey].initialize();
    }
  }
  controllerInstances[instanceKey]._EXPIRES = getExpired(sessionTime);
  return controllerInstances[instanceKey];
}

function getExpired(sessionTime: number) {
  return Date.now() + sessionTime;
}

function cleanControllerInstances() {
  for (const key of Object.keys(controllerInstances)) {
    const controller = controllerInstances[key];
    if (controller._EXPIRES > Date.now()) {
      continue;
    }
    delete controllerInstances[key];
  }
}
