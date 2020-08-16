import { DbConnection } from "./DbConnection";
import { DBConfig } from "./DbConfig";
import { Logger, DBMigrations } from "./types";
import { injectable, inject } from "inversify";
import { Symbols } from "./Symbols";

@injectable()
export class DbConnectionProvider {
  private connection: DbConnection;
  constructor(
    private dbConfig: DBConfig,
    @inject(Symbols.Logger) private logger: Logger,
    @inject(Symbols.DBMigrations) private dbMigrations: DBMigrations
  ) {}

  public async getConnection() {
    if (this.connection) {
      return this.connection;
    }

    this.connection = new DbConnection(this.dbConfig, this.logger);
    await this.connection.init();
    await this.dbMigrations.runMigrations();
    return this.connection;
  }
}
