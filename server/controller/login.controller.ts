import {
  Controller,
  IControllerInit,
  inject,
  IRequest,
  IResponse,
} from "framework";
import { UserService } from "../services/authentication/user.service.ts";

export interface ILoginData {
  login: string;
  password: string;
}

@Controller("/login")
export class LoginController implements IControllerInit {
  logindata: ILoginData = {
    login: "",
    password: "",
  };
  private readonly userService = inject(UserService);

  initialize(): void {
    this.logindata.login = "test";
    this.logindata.password = "test";
  }

  async login(req: IRequest, res: IResponse) {
    if (!req.body.login || !req.body.password) {
      res.setHeader("HX-Redirect", "/login");
      res.send();
      return;
    }
    const foundUser = await this.userService?.getUser(req.body.login);
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
