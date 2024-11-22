import {
  Controller,
  IControllerInit,
  inject,
  IRequest,
  IResponse,
  TranslationStore,
} from "framework";
import { UserService } from "../services/authentication/user.service.ts";
import { TRANSLATION_STORE_TOKEN } from "../translations.ts";

type ITranslations = {
  loginData: string;
  password: string;
  login: string;
};

export interface ILoginData {
  login: string;
  password: string;
}

@Controller("/login")
export class LoginController implements IControllerInit {
  private readonly userService = inject(UserService);
  private readonly translationStore = inject<TranslationStore>(
    TRANSLATION_STORE_TOKEN
  );
  logindata: ILoginData = {
    login: "",
    password: "",
  };
  texts: ITranslations | null = null;

  async initialize(req: IRequest) {
    this.texts = await this.translationStore.mapObject<ITranslations>(
      {
        login: "login",
        loginData: "login_data",
        password: "password",
      },
      req.cookies?.language ?? "en"
    );
    this.logindata.login = "test";
    this.logindata.password = "test";
  }

  async login(req: IRequest, res: IResponse) {
    if (!req.body.login || !req.body.password) {
      res.setHeader("HX-Redirect", "/login");
      res.send();
      return;
    }
    const foundUser = await this.userService?.getUserByEmail(req.body.login);
    if (!foundUser) {
      res.setHeader("HX-Redirect", "/login");
      res.send();
      return;
    }
    if (!req.cookies?.session) {
      res.cookie("session", foundUser.email);
    }
    res.setHeader("HX-Redirect", "/");
    res.send();
  }
}
