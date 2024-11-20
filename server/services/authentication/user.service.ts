import { inject, Injectable } from "framework";
import { UserEntity } from "../../entities/user.ts";
import { AuthenticationStore } from "../../entities/store/authentication.store.ts";

@Injectable()
export class UserService {
  private readonly store = inject(AuthenticationStore);

  async getUserByEmail(email: string) {
    const users = await this.store.find(UserEntity, {email});
    return users[0] ?? null;
  }

  saveUsers(users: Array<UserEntity>) {
    return this.store.save(UserEntity, users);
  }

  archiveUsers(ids: string[]) {
    return this.store.delete(UserEntity, ids, true);
  }

  deleteUsers(ids: string[]) {
    return this.store.delete(UserEntity, ids)
  }
}
