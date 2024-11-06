import { buildServer } from "framework";
import { join } from "@std/path";
import { IndexController } from "./controller/index.controller.ts";
import { handlers } from "./handler/registry.ts";

buildServer({
  reservedNames: ["/api/"],
  templatesDir: join(import.meta.dirname ?? "", "views"),
  apiHandler: handlers,
  controllers: [IndexController],
}).listen(3000);
