import { ODatabaseSession } from "orientjs";
import { DbConnection } from "./DbConnection";
export interface DbOperationOptions {
    session?: ODatabaseSession;
}

export interface DbFindOperationOptions extends DbOperationOptions {
    skip?: number;
    limit?: number;
}

export interface Logger {
    info(...args);
    warn(...args);
    error(...args);
}

export type ObjectType<T> = new () => T;

export type WhereCondition<T> = Partial<T> | string;

export type FieldSelection<T> = (keyof T)[] | string;

export interface RecordTransformer {
    transformRecord(record: any);
}

export interface DBMigrations {
    runMigrations(connection: DbConnection);
}

export interface DBConfig {
    host: string;
    port: number;
    useSSL: boolean;
    databaseName: string;
    userName: string;
    userPassword: string;
}
