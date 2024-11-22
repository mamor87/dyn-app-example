import { buildServer } from "framework";
import { uiComponents } from "ui";
import { join } from "@std/path";
import { IndexController } from "./controller/index.controller.ts";
import { handlers } from "./handler/registry.ts";
import { LoginController } from "./controller/login.controller.ts";
import { RegistrationController } from "./controller/registration.controller.ts";
import { setupTranslations } from "./translations.ts";

setupTranslations().then(() => {
  buildServer({
    sessionTime: 24 * 60 * 60 * 1000,
    templatesDir: join(import.meta.dirname ?? "", "views"),
    publicDir: join(import.meta.dirname ?? "", "public"),
    apiHandler: handlers,
    controllers: [IndexController, LoginController, RegistrationController],
    componentLoader: uiComponents,
  }).listen(3000);
});
