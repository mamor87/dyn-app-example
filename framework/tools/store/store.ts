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
  find<T extends BaseEntity>(target: new () => T, filter: Partial<T>): Promise<T[]>;
  save<T extends BaseEntity>(target: new () => T, instances: T[]): Promise<T[]>;
  delete<T extends BaseEntity>(target: new () => T, ids: string[], softDelete?: boolean): Promise<number>;
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

  async find<T extends BaseEntity>(target: new () => T, filter: Partial<T>): Promise<T[]> {
    const [repo, err] = await this.getRepo(target);
    if (err) {
      return [];
    }
    return (await repo?.findBy(filter)) as T[] ?? new Array<T>();
  }

  async save<T extends BaseEntity>(target: new () => T, instances: T[]): Promise<T[]> {
    const [repo, err] = await this.getRepo(target);
    if (err) {
      return [];
    }
    return (await repo?.save(instances)) ?? new Array<T>();
  }

  async delete<T extends BaseEntity>(target: new () => T, ids: string[], softDelete?: boolean): Promise<number> {
    const [repo, err] = await this.getRepo(target);
    if (err) {
      return 0;
    }
    if (!softDelete) {
      const result = await repo?.delete(ids);
      return result?.affected ?? 0;
    }
    const result = await repo?.softDelete(ids);
    return result?.affected ?? 0;
  }
}
