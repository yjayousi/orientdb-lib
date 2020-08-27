import { DbConnection } from "./DbConnection";
import { Logger, DBMigrations, DBConfig } from "./types";
import { injectable, inject } from "inversify";
import { Symbols } from "./Symbols";

@injectable()
export class DbConnectionProvider {
    private connection: DbConnection;
    constructor(
        @inject(Symbols.DBConfig) private dbConfig: DBConfig,
        @inject(Symbols.Logger) private logger: Logger,
        @inject(Symbols.DBMigrations) private dbMigrations: DBMigrations
    ) {}

    public async getConnection() {
        if (this.connection) {
            return this.connection;
        }

        this.connection = new DbConnection(this.dbConfig, this.logger);
        await this.connection.init();
        await this.dbMigrations.runMigrations(this.connection);
        return this.connection;
    }
}
