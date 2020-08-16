import { ObjectType, FieldSelection, RecordTransformer, Logger } from "./types";
import { Repository } from "./Repository";
import { DbConnectionProvider } from "./DbConnectionProvider";
import { BaseVertex } from "./BaseVertex";
import { injectable, inject } from "inversify";
import { Symbols } from "./Symbols";

@injectable()
export class RepositoryFactory {
  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(Symbols.RecordTransformer) private recordTransformer: RecordTransformer,
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
