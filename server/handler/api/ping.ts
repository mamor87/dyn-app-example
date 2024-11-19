import { IRequest, IResponse } from "framework";

export function PingHandler(_req: IRequest, res: IResponse) {
  res.send("pong");
}
