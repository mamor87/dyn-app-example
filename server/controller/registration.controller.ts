import {
  Controller,
  IControllerInit,
  inject,
  IRequest,
  IResponse,
  TranslationStore,
} from "framework";
import { TRANSLATION_STORE_TOKEN } from "../translations.ts";

type ITranslations = {
  register: string;
  name: string;
  email: string;
  password: string;
  passwordRepeat: string;
};

export interface IRegistration {
  name: string;
  email: string;
  password: string;
  passwordRepeat: string;
  // @mmorgenstern TODO: implement date  picker
  birthday: string;
  // @mmorgenstern TODO: implement unit value
  weight: number;
  // @mmorgenstern TODO: implement unit value
  height: number;
  // @mmorgenstern TODO: implement selection
  gender: number;
  // @mmorgenstern TODO: implement slider
  activityLevel: number;
}

@Controller("/registration")
export class RegistrationController implements IControllerInit {
  private readonly translationStore = inject<TranslationStore>(
    TRANSLATION_STORE_TOKEN
  );
  registration: IRegistration = {
    name: "",
    email: "",
    password: "",
    passwordRepeat: "",
    birthday: "",
    weight: 0,
    height: 0,
    gender: 0,
    activityLevel: 0,
  };
  texts: ITranslations | null = null;

  async initialize(req: IRequest) {
    this.texts = await this.translationStore.mapObject<ITranslations>(
      {
        register: "register",
        name: "name",
        email: "email",
        password: "password",
        passwordRepeat: "password_repeat",
      },
      req.cookies?.language ?? "en"
    );
  }

  send(req: IRequest, res: IResponse) {}
}
