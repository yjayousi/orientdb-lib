// tslint:disable: max-classes-per-file no-console
import "reflect-metadata";
import { Container, injectable, inject } from "inversify";
import { Symbols } from "./Symbols";
import { Logger, DBMigrations, RecordTransformer, DBConfig } from "./types";
import { DbConnectionProvider } from "./DbConnectionProvider";
import { DBShell } from "./DbShell";
import { RepositoryFactory } from "./RepositoryFactory";

@injectable()
class AppLogger implements Logger {
    info(...args: any[]) {
        console.log(...args);
    }
    warn(...args: any[]) {
        console.warn(...args);
    }
    error(...args: any[]) {
        console.error(...args);
    }
}

@injectable()
class AppDBMigrations implements DBMigrations {
    runMigrations() {
        throw new Error("Method not implemented.");
    }
}

@injectable()
class AppRecordTransformer implements RecordTransformer {
    transformRecord(record: any) {
        throw new Error("Method not implemented.");
    }
}

@injectable()
class AppDBConfig implements DBConfig {
    host: "";
    port: 12;
    useSSL: true;
    databaseName: "dbname";
    userName: "admin";
    userPassword: "pass";
}

const container = new Container();
container.bind<Logger>(Symbols.Logger).to(AppLogger);
container.bind<DBMigrations>(Symbols.DBMigrations).to(AppDBMigrations);
container.bind<RecordTransformer>(Symbols.RecordTransformer).to(AppRecordTransformer);
container.bind<DbConnectionProvider>(DbConnectionProvider).to(DbConnectionProvider);
container.bind<DBShell>(DBShell).to(DBShell);
container.bind<RepositoryFactory>(RepositoryFactory).to(RepositoryFactory);
container.bind<DBConfig>(Symbols.DBConfig).to(AppDBConfig);

test("testing DI", () => {
    expect(container.get(DbConnectionProvider)).toBeTruthy();
});
