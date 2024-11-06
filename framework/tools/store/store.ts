import {
  DataSource,
  EntitySchema,
  ObjectLiteral,
  EntityTarget,
  Repository,
} from "npm:typeorm";
import { BaseEntity } from "./base.ts";
import { ErrorResult } from "../../types/error.result.ts";

export interface IStore {
  getRepo(
    target: EntityTarget<ObjectLiteral>
  ): Promise<ErrorResult<Repository<ObjectLiteral> | null>>;
}

export class Store implements IStore {
  private dataSource: DataSource | null = null;
  constructor(
    private name: string,
    private entities: Array<(new () => BaseEntity) | string | EntitySchema>,
    private drop = false
  ) {}

  async getRepo(
    target: new () => BaseEntity
  ): Promise<ErrorResult<Repository<ObjectLiteral> | null>> {
    const exists = this.entities.find((e) =>
      typeof e === "function"
        ? e.name === target.name
        : e instanceof EntitySchema
        ? e.options.name === target.name
        : typeof e === typeof ""
        ? e === target.name
        : false
    );
    if (!exists) {
      return [
        null,
        new Error(`Entity ${target.name} not registered in Store ${this.name}`),
      ];
    }

    if (!this.dataSource) {
      this.dataSource = new DataSource({
        type: "sqlite",
        database: `data/${this.name}.db`,
        entities: this.entities,
        synchronize: true,
        dropSchema: this.drop,
      });
      await this.dataSource.initialize();
    }
    return [this.dataSource.getRepository(target), null];
  }
}
