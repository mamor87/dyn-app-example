import type { Request, Response } from "npm:@types/express";

export function PingHandler(_req: Request, res: Response) {
  res.send("pong");
}
