import { DbConnectionProvider } from "./DbConnectionProvider";
import { Logger, DbOperationOptions } from "./types";
import { injectable, inject } from "inversify";
import { Symbols } from "./Symbols";

@injectable()
export class DBShell {
    constructor(@inject(Symbols.Logger) private logger: Logger, private dbConnectionProvider: DbConnectionProvider) {}

    public async executeQuery(q: string, options?: DbOperationOptions): Promise<any[]> {
        const connection = await this.dbConnectionProvider.getConnection();
        return connection
            .usingSession(async (session) => {
                const results = session.query(q).all();
                return results;
            }, options)
            .catch((e) => {
                this.logger.error(`executeQuery error in ${q}`, e);
                throw e;
            });
    }

    public async executeCommand(command: string, options?: DbOperationOptions): Promise<any[]> {
        const connection = await this.dbConnectionProvider.getConnection();
        return connection
            .usingSession(async (session) => {
                const results = session.command(command).all();
                return results;
            }, options)
            .catch((e) => {
                this.logger.error(`executeCommand error in ${command}`, e);
                throw e;
            });
    }

    public async creatEdge(
        edge: string,
        fromVertex: object,
        toVertex: object,
        dbOpOptions?: DbOperationOptions
    ): Promise<boolean> {
        await this.executeCommand(`CREATE EDGE ${edge} FROM ${fromVertex["@rid"]} TO ${toVertex["@rid"]}`, dbOpOptions);
        return true;
    }

    public async creatEdgeWithProps(
        edge: string,
        fromVertex: object,
        toVertex: object,
        props: any,
        dbOpOptions?: DbOperationOptions
    ): Promise<boolean> {
        props.created_at = Date.now();
        await this.executeCommand(
            `CREATE EDGE ${edge} FROM ${fromVertex["@rid"]} TO ${toVertex["@rid"]} CONTENT ${JSON.stringify(props)} `,
            dbOpOptions
        );
        return true;
    }

    public async updateEdgeProps(
        edge: string,
        fromVertex: object,
        toVertex: object,
        props: any,
        dbOpOptions?: DbOperationOptions
    ): Promise<boolean> {
        this.executeCommand(
            `UPDATE (SELECT FROM ${edge} WHERE out=${fromVertex["@rid"]} AND in=${
                toVertex["@rid"]
            }) MERGE ${JSON.stringify(props)}`,
            dbOpOptions
        );
        return true;
    }

    public async deleteEdge(
        edge: string,
        fromVertex: object,
        toVertex: object,
        dbOpOptions?: DbOperationOptions
    ): Promise<boolean> {
        await this.executeCommand(
            `DELETE EDGE FROM ${fromVertex["@rid"]} TO ${toVertex["@rid"]} WHERE @class = "${edge}"`,
            dbOpOptions
        );
        return true;
    }
}
