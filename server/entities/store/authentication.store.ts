import { Injectable, Store } from "framework";
import { UserEntity } from "../user.ts";

@Injectable()
export class AuthenticationStore extends Store {
  constructor() {
    super("authentication", [UserEntity]);
  }
}
