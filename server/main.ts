// @deno-types="@types/express"
import express from "express";
import { registerApi } from "./handler/api/registry.ts";
import { registerTemplates } from "./handler/template/registry.ts";

const app = express();
registerApi(app);
registerTemplates(app);
app.listen(3000);
