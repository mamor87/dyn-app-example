// @deno-types="@types/express"
import { Express } from "express";
import { TemplateLoader } from "framework";
import { join } from "@std/path";

const reservedNames = ["/api/"];
let templateLoader: TemplateLoader | null = null;
function getTemplateLoader(): TemplateLoader {
  if (!templateLoader) {
    templateLoader = new TemplateLoader({
      templatesDir: join(import.meta.dirname ?? "", "..", "..", "views"),
    });
  }
  return templateLoader;
}

export function registerTemplates(app: Express) {
  app.use((req, res, next) => {
    for (const reservedName of reservedNames) {
      if (req.path.startsWith(reservedName)) {
        next();
        return;
      }
    }

    const loader = getTemplateLoader();
    loader.execute(req, res, { user: { name: "Markus" } });
  });
}
