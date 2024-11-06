// @deno-types="@types/express"
import { Request, Response } from "express";
import { join } from "@std/path";
import { ErrorResult } from "framework";
import Handlebars from "handlebars";

function getErrorTemplate(err: Error): string {
  return `<h1>load Template File [Error ${err?.name}]: ${err?.message}</h1>`;
}

export interface ITemplateLoaderOptions {
  templatesDir: string;
  // deno-lint-ignore ban-types
  helpers?: Record<string, Function>;
}

export class TemplateLoader {
  private static options: ITemplateLoaderOptions = {
    templatesDir: join(import.meta.dirname ?? "", "views"),
  };
  private static readonly templateCache: Record<string, string> = {};

  constructor(options: ITemplateLoaderOptions) {
    TemplateLoader.options = options;
  }

  execute<T>(req: Request, res: Response, data: T) {
    try {
      const rawTemplate = this.getTemplate(req.path);
      const result = Handlebars.compile(rawTemplate)(
        data,
        TemplateLoader.getExecuteOptions()
      );
      res.send(result);
    } catch (err) {
      res.status(501).send(getErrorTemplate(err as Error));
    }
  }

  private getTemplate(path: string): string {
    if (!path.endsWith(".hbs")) {
      path += ".hbs";
    }
    if (TemplateLoader.templateCache[path]) {
      return TemplateLoader.templateCache[path];
    }
    const [content, error] = TemplateLoader.loadFile(
      TemplateLoader.options,
      ...path.split("/")
    );
    if (error) {
      return content;
    }
    TemplateLoader.templateCache[path] = content;
    return TemplateLoader.templateCache[path];
  }

  private static loadPartial<T>(path: string, data: T): string {
    if (!path.endsWith(".hbs")) {
      path += ".hbs";
    }
    const [content, error] = TemplateLoader.loadFile(
      {
        templatesDir: join(TemplateLoader.options.templatesDir, "partials"),
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
      helpers: {
        component: this.loadPartial.bind(this),
        ...TemplateLoader.options.helpers,
      },
    };
  }
}
