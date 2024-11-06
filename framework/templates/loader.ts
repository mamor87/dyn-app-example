// @deno-types="@types/express"
import { Request, Response } from "express";
import { join, basename } from "@std/path";
import { ErrorResult, getController } from "framework";
import Handlebars from "handlebars";
import { IController } from "./controller.ts";

function getErrorTemplate(err: Error): string {
  return `<h1>load Template File [Error ${err?.name}]: ${err?.message}</h1>`;
}

export interface ITemplateLoaderOptions {
  templatesDir: string;
  // deno-lint-ignore ban-types
  helpers?: Record<string, Function>;
  controllers?: Array<new () => IController>;
}

export class TemplateLoader {
  private static readonly componentDir = "components";
  private static readonly layoutDir = "layouts";
  private static readonly pageDir = "pages";
  private static readonly templateEndings = [".hbs"];
  private static options: ITemplateLoaderOptions = {
    templatesDir: join(import.meta.dirname ?? "", "views"),
  };
  private static readonly pageCache: Record<string, string> = {};
  private static readonly layoutCache: Record<
    string,
    HandlebarsTemplateDelegate
  > = {};

  constructor(options: ITemplateLoaderOptions) {
    TemplateLoader.options = options;
  }

  execute(req: Request, res: Response) {
    try {
      this.getLayouts();
      const rawTemplate = this.getPage(req.path);
      let path = req.path;
      if (path === "/" || path === "") {
        path = "/index";
      }
      const controllerConstructor = getController(path);
      let data: IController | null = null;
      if (controllerConstructor) {
        data = new controllerConstructor();
        data.initialize();
      }
      const result = Handlebars.compile(rawTemplate)(
        data,
        TemplateLoader.getExecuteOptions()
      );
      res.send(result);
    } catch (err) {
      res.status(501).send(getErrorTemplate(err as Error));
    }
  }

  private getPage(path: string): string {
    if (path === "/" || path === "") {
      path = "/index.hbs";
    }
    if (!TemplateLoader.allowedTemplateEnding(path)) {
      path += ".hbs";
    }
    if (TemplateLoader.pageCache[path]) {
      return TemplateLoader.pageCache[path];
    }
    const [content, error] = TemplateLoader.loadFile(
      {
        templatesDir: join(
          TemplateLoader.options.templatesDir,
          TemplateLoader.pageDir
        ),
      },
      ...path.split("/")
    );
    if (error) {
      return content;
    }
    TemplateLoader.pageCache[path] = content;
    return TemplateLoader.pageCache[path];
  }

  private getLayouts() {
    for (const entry of Deno.readDirSync(
      join(TemplateLoader.options.templatesDir, TemplateLoader.layoutDir)
    )) {
      if (entry.isDirectory) {
        continue;
      }
      if (!TemplateLoader.allowedTemplateEnding(entry.name)) {
        continue;
      }
      const key = basename(entry.name).split(".")[0];
      if (!key) {
        continue;
      }
      if (TemplateLoader.layoutCache[key]) {
        continue;
      }
      const [content, error] = TemplateLoader.loadFile(
        {
          templatesDir: join(
            TemplateLoader.options.templatesDir,
            TemplateLoader.layoutDir
          ),
        },
        entry.name
      );
      if (error) {
        continue;
      }
      TemplateLoader.layoutCache[key] = Handlebars.compile(content);
    }
  }

  private static load<T>(path: string, data: T, source: string): string {
    if (!TemplateLoader.allowedTemplateEnding(path)) {
      path += ".hbs";
    }
    const [content, error] = TemplateLoader.loadFile(
      {
        templatesDir: join(TemplateLoader.options.templatesDir, source),
      },
      path
    );
    if (error) {
      return content;
    }
    try {
      return Handlebars.compile(content)(
        data,
        TemplateLoader.getExecuteOptions()
      );
    } catch (err) {
      return getErrorTemplate(err as Error);
    }
  }

  private static loadFile(
    options: ITemplateLoaderOptions,
    ...name: string[]
  ): ErrorResult<string> {
    let content = "";
    try {
      const decoder = new TextDecoder("utf-8");
      content = decoder.decode(
        Deno.readFileSync(join(options.templatesDir, ...name))
      );
    } catch (err) {
      content = getErrorTemplate(err as Error);
      return [content, err as Error];
    }
    return [content, null];
  }

  private static getExecuteOptions() {
    return {
      partials: TemplateLoader.layoutCache,
      helpers: {
        // deno-lint-ignore no-explicit-any
        component: (path: string, data: any) =>
          this.load.bind(this)(path, data, TemplateLoader.componentDir),
        ...TemplateLoader.options.helpers,
      },
    };
  }

  private static allowedTemplateEnding(path: string): boolean {
    for (const ending of TemplateLoader.templateEndings) {
      if (path.endsWith(ending)) {
        return true;
      }
    }
    return false;
  }
}
