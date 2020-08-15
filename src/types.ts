import { ODatabaseSession } from "orientjs";
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

export type FieldSelection<T> = Array<keyof T> | string;

export interface RecordTransformer {
  transformRecord(record: any);
}

export interface DBMigrations {
  runMigrations();
}
