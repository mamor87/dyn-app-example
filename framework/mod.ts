import type { Request, Response } from "npm:@types/express";

export interface IRequest extends Request {}
export interface IResponse extends Response {}

export * from "./types/error.result.ts";
export { BaseEntity } from "./tools/store/base.ts";
export { Store } from "./tools/store/store.ts";
export * from "./templates/controller.ts";
export * from "./templates/loader.ts";
export * from "./server/server.ts";
export * from "./di/injectable.ts";
export * from "./tools/translations/store.ts";
export * from "./tools/translations/translation.entity.ts";
export * as typeorm from "typeorm";
