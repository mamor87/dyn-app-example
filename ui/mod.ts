import { IComponentLoader } from "framework";
import { BASIC_INPUT } from "./inputs/basic.ts";
import { EMAIL_INPUT } from "./inputs/email.ts";
import { PASSWORD_INPUT } from "./inputs/password.ts";
import { TEXT_INPUT } from "./inputs/text.ts";

const REGISTRY: Record<string, string> = {
  "inputs->basic": BASIC_INPUT,
  "inputs->email": EMAIL_INPUT,
  "inputs->password": PASSWORD_INPUT,
  "inputs->text": TEXT_INPUT,
}

export function uiComponents(): IComponentLoader {
  return {
    load: (path: string) => {
      return REGISTRY[path] ?? "";
    },
  }
}