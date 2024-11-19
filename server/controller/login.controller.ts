import { Controller, IControllerInit, IRequest, IResponse } from "framework";

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

  initialize(): void {
    this.logindata.login = "test";
    this.logindata.password = "test";
  }

  login(req: IRequest, res: IResponse): void {
    if (!req.cookies?.session) {
      res.cookie("session", "login");
    }
    res.setHeader("HX-Redirect", "/");
    res.send();
  }
}
