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

        const connection = new DbConnection(this.dbConfig, this.logger);
        await connection.init();
        await this.dbMigrations.runMigrations(connection);
        this.connection = connection;
				this.logger.info("DbConnectionProvider: opened Connection");
        return connection;
    }

    public async closeConnection() {
        if (this.connection) {
            await this.connection.close();
            this.connection = null;
						this.logger.info("DbConnectionProvider: closed Connection");
        }
    }
}
