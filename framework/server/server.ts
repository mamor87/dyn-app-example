// @deno-types="@types/express"
import express from "express";
import cookieParser from "cookie-parser";
import { TemplateLoader } from "../templates/loader.ts";
import { BASE_SESSION_TIME } from "../const/session.ts";

export interface IServerOptions {
  sessionTime?: number;
  templatesDir: string;
  // deno-lint-ignore no-explicit-any
  controllers?: Array<new () => any>;
  apiHandler?: Record<
    string,
    (req: express.Request, res: express.Response) => void
  >;
}

let templateLoader: TemplateLoader | null = null;
function getTemplateLoader(
  sessionTime: number,
  templatesDir: string,
  // deno-lint-ignore no-explicit-any
  controllers: Array<new () => any>
): TemplateLoader {
  if (!templateLoader) {
    templateLoader = new TemplateLoader({
      sessionTime,
      templatesDir,
      controllers,
    });
  }
  return templateLoader;
}

export function buildServer(options: IServerOptions) {
  if (!options.sessionTime) {
    options.sessionTime = BASE_SESSION_TIME;
  }
  const app = express();
  app.use(cookieParser());

  app.use((req, res, next) => {
    if (!req?.cookies?.browserId) {
      req.cookies = {
        ...req.cookies,
        browserId: crypto.randomUUID(),
      };
    }
    res.cookie("browserId", req.cookies.browserId, {maxAge: options.sessionTime});
    next();
  });

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
    if (options.apiHandler) {
      for (const key of Object.keys(options.apiHandler)) {
        const [method, path] = key.split(":");
        if (req.method !== method || !req.path.startsWith(path)) {
          continue;
        }
        next();
        return;
      }
    }

    const loader = getTemplateLoader(
      options.sessionTime ?? BASE_SESSION_TIME,
      options.templatesDir,
      options.controllers ?? []
    );
    loader.execute(req, res);
  });

  return app;
}
