import { Injectable, Store } from "framework";
import { UserEntity } from "../../entities/user.ts";

@Injectable()
export class UserService {
  private readonly store = new Store("authentication", [UserEntity]);

  async getUser(email: string) {
    const [repo, err] = await this.store.getRepo(UserEntity);
    if (err) {
      return null;
    }
    return (await repo?.findOneBy({ email })) ?? null;
  }
}
