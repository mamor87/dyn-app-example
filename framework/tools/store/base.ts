import { Column } from "npm:typeorm";

export class BaseEntity {
  @Column("text", { primary: true })
  readonly id = crypto.randomUUID();
}
