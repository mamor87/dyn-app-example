import { BaseEntity } from "framework";
import { Entity, Column } from "typeorm";

@Entity()
export class TranslationEntity extends BaseEntity {
  @Column("text")
  key = "";
  @Column("text")
  code = "";
  @Column("text")
  text = "";
}