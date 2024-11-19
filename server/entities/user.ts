import { BaseEntity, typeorm } from "framework";

@typeorm.Entity()
export class UserEntity extends BaseEntity {
  @typeorm.Column("text")
  email = "";
  @typeorm.Column("text")
  passwordHash = "";
}
