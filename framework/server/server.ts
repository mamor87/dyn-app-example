import { IController } from "../templates/controller.ts";
// @deno-types="@types/express"
import express from "express";
import { TemplateLoader } from "../templates/loader.ts";

export interface IServerOptions {
  templatesDir: string;
  reservedNames: Array<string>;
  controllers?: Array<new () => IController>;
  apiHandler?: Record<
    string,
    (req: express.Request, res: express.Response) => void
  >;
}

let templateLoader: TemplateLoader | null = null;
function getTemplateLoader(
  templatesDir: string,
  controllers: Array<new () => IController>
): TemplateLoader {
  if (!templateLoader) {
    templateLoader = new TemplateLoader({
      templatesDir,
      controllers,
    });
  }
  return templateLoader;
}

export function buildServer(options: IServerOptions) {
  const app = express();

  if (options.apiHandler) {
    for (const key of Object.keys(options.apiHandler)) {
      const [method, path] = key.split(":");
      if (!method || !path) {
        console.warn(`invalid handler key ${key}`);
        continue;
      }
      switch (method.toLowerCase()) {
        case "get":
          app.get(path, options.apiHandler[key]);
          continue;
        case "post":
          app.post(path, options.apiHandler[key]);
          continue;
        case "put":
          app.put(path, options.apiHandler[key]);
          continue;
        case "delete":
          app.delete(path, options.apiHandler[key]);
          continue;
      }
      console.warn(`invalid method ${method} in key ${key}`);
    }
  }

  app.use((req, res, next) => {
    for (const reservedName of options.reservedNames) {
      if (req.path.startsWith(reservedName)) {
        next();
        return;
      }
    }

    const loader = getTemplateLoader(
      options.templatesDir,
      options.controllers ?? []
    );
    loader.execute(req, res);
  });

  return app;
}
