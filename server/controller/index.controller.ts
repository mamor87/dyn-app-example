import { Controller, IController } from "framework";

@Controller("/index")
export class IndexController implements IController {
  user: { name: string; age: number } = {
    name: "",
    age: 0,
  };

  initialize(): void {
    this.user.name = "Markus";
    this.user.age = 37;
  }
}
