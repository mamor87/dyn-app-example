import { PingHandler } from "./api/ping.ts";

export const handlers = {
  "get:/api/ping": PingHandler,
};
