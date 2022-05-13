// tslint:disable: max-classes-per-file no-console

import { logger } from "./../utils/logger";

import { Container, injectable, inject } from "inversify";
import { DBConfig, DBMigrations, Logger, RecordTransformer } from '../types';
import { DbConnection } from '../DbConnection';
import { Symbols } from '../Symbols';
import { DbConnectionProvider } from '../DbConnectionProvider';
import { DBShell } from '../DbShell';
import { RepositoryFactory } from '../RepositoryFactory';
import { OrientDBClient, ODatabaseSession } from "orientjs";

@injectable()
class AppLogger implements Logger {
    info(...args: any[]) {
        logger.info(...args);
    }
    warn(...args: any[]) {
        logger.warn(...args);
    }
    error(...args: any[]) {
        logger.error(...args);
    }
}

@injectable()
class AppDBMigrations implements DBMigrations {
    async runMigrations(connection: DbConnection) {
    }
}

@injectable()
class AppRecordTransformer implements RecordTransformer {
    transformRecord(record: any) {
        record._id = record?.id?.toString();
        return record;
    }
}

const dbConfig: DBConfig = {
    host: process.env.ORIENT_HOST,
    port: Number(process.env.ORIENT_PORT),
    useSSL: process.env.ORIENT_USE_SSL === "true" || false,
    databaseName: process.env.ORIENT_DATABASE_NAME,
    userName: process.env.ORIENT_USER_NAME,
    userPassword: process.env.ORIENT_USER_PASSWORD
};

export const orientdbContainer = new Container({ defaultScope: "Singleton" });
orientdbContainer.bind<Logger>(Symbols.Logger).to(AppLogger);
orientdbContainer.bind<DBMigrations>(Symbols.DBMigrations).to(AppDBMigrations);
orientdbContainer.bind<RecordTransformer>(Symbols.RecordTransformer).to(AppRecordTransformer);
orientdbContainer.bind<DbConnectionProvider>(DbConnectionProvider).to(DbConnectionProvider);
orientdbContainer.bind<DBShell>(DBShell).to(DBShell);
orientdbContainer.bind<RepositoryFactory>(RepositoryFactory).to(RepositoryFactory);
orientdbContainer.bind<DBConfig>(Symbols.DBConfig).toConstantValue(dbConfig);

export const connectOrientDB = async () => {
    const dbConnectionProvider = orientdbContainer.get(DbConnectionProvider);
    return dbConnectionProvider.getConnection();
};

/**
 * Added this function to fix the connection pooling issue in kafka consumer
 * @returns single database session
 */
export const createDbClient = async (): Promise<OrientDBClient> => {
    try {
        return OrientDBClient.connect({
            host: process.env.ORIENT_HOST,
            port: Number(process.env.ORIENT_PORT),
            ssl: { enabled: process.env.ORIENT_USE_SSL === "true" || false }
        });
    } catch (error) {
        console.error("createDBClient error : ", error);
        throw error;
    }
};

export const createDbSession = async (client: OrientDBClient): Promise<ODatabaseSession> => {
    try {
        return client.session({
            name: process.env.ORIENT_DATABASE_NAME,
            username: process.env.ORIENT_USER_NAME,
            password: process.env.ORIENT_USER_PASSWORD
        });
    } catch (error) {
        console.error("createDbSession error : ", error);
        throw error;
    }
};

export const getOrientdbConnection = () => connectOrientDB();
