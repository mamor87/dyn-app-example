// @deno-types="@types/express"
import express from "express";
import cookieParser from "cookie-parser";
import { IComponentLoader, TemplateLoader } from "../templates/loader.ts";
import { BASE_SESSION_TIME } from "../const/session.ts";

export interface IServerOptions {
  sessionTime?: number;
  templatesDir?: string;
  publicDir?: string;
  componentLoader?: () => IComponentLoader;
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
  controllers: Array<new () => any>,
  componentLoader?: () => IComponentLoader
): TemplateLoader {
  if (!templateLoader) {
    templateLoader = new TemplateLoader({
      sessionTime,
      templatesDir,
      controllers,
      componentLoader,
    });
  }
  return templateLoader;
}

export function buildServer(options: IServerOptions) {
  if (!options.sessionTime) {
    options.sessionTime = BASE_SESSION_TIME;
  }
  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use((req, res, next) => {
    if (!req?.cookies?.browserId) {
      req.cookies = {
        ...req.cookies,
        browserId: crypto.randomUUID(),
      };
    }
    if (!req?.cookies?.language) {
      req.cookies = {
        ...req.cookies,
        language: getPreferredLanguage(req.headers["accept-language"] ?? ""),
      };
    }
    res.cookie("browserId", req.cookies.browserId, {
      maxAge: options.sessionTime,
    });
    res.cookie("language", req.cookies.language, {
      maxAge: options.sessionTime,
    });
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

  if (options.templatesDir) {
    app.use(async (req, res, next) => {
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
        options.templatesDir ?? "",
        options.controllers ?? [],
        options.componentLoader
      );
      for (const ending of loader.templateEndings) {
        const parts = req.path.split("/");
        if (
          req.path.endsWith(ending) ||
          (parts.length > 0 && !parts[parts.length - 1].includes("."))
        ) {
          await loader.execute(req, res);
          return;
        }
      }
      next();
    });
  }

  if (options.publicDir) {
    app.use(express.static(options.publicDir));
  }

  return app;
}

function getPreferredLanguage(value: string, defaultValue = "en"): string {
  for (const v of value.split(";")) {
    if (v.startsWith("q=") || !v.includes(",")) {
      continue;
    }
    const tmp = v.split(",");
    if (tmp.length < 2) {
      continue;
    }
    return tmp[1];
  }
  return defaultValue;
}
