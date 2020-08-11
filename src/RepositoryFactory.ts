import { ObjectType, FieldSelection, RecordTransformer, Logger } from "./types";
import { Repository } from "./Repository";
import { DbConnectionProvider } from "./DbConnectionProvider";
import { BaseVertex } from "./BaseVertex";
import { Service } from "typedi";
@Service()
export class RepositoryFactory {
  constructor(
    private logger: Logger,
    private recordTransformer: RecordTransformer,
    private dbConnectionProvider: DbConnectionProvider
  ) {}

  public createRepository<T extends BaseVertex>(vertexType: ObjectType<T>, defaultExcludedFields?: FieldSelection<T>) {
    return new Repository(
      this.logger,
      this.recordTransformer,
      this.dbConnectionProvider,
      vertexType,
      defaultExcludedFields
    );
  }
}
