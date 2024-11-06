import type { Express } from "npm:@types/express";
import { PingHandler } from "./ping.ts";

export function registerApi(app: Express) {
  app.get('/api/ping', PingHandler);
}