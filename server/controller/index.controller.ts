import { Controller, IControllerInit, IRequest, IResponse } from "framework";

@Controller("/index")
export class IndexController implements IControllerInit {
  user: { name: string; age: number } = {
    name: "",
    age: 0,
  };

  async initialize() {
    this.user.name = "Markus";
    this.user.age = 37;
  }

  logout(_req: IRequest, res: IResponse): void {
    res.clearCookie("login");
    res.setHeader("HX-Redirect", "/login");
    res.send();
  }
}
