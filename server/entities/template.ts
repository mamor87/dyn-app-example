import { typeorm, BaseEntity } from "framework";

@typeorm.Entity()
export class TemplateEntity extends BaseEntity {
  @typeorm.Column("text")
  name = "";
  @typeorm.Column("text")
  template = "";
}
