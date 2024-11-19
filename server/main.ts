import { buildServer } from "framework";
import { join } from "@std/path";
import { IndexController } from "./controller/index.controller.ts";
import { handlers } from "./handler/registry.ts";
import { LoginController } from "./controller/login.controller.ts";

buildServer({
  sessionTime: 24 * 60 * 60 * 1000,
  templatesDir: join(import.meta.dirname ?? "", "views"),
  apiHandler: handlers,
  controllers: [IndexController, LoginController],
}).listen(3000);
