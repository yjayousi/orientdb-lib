import { ODatabaseSession, ODatabaseSessionPool, OrientDBClient } from "orientjs";
import { DBConfig } from "./types";
import { DbOperationOptions, Logger } from "./types";

export class DbConnection {
  constructor(private dbConfig: DBConfig, private logger: Logger) {}
  private client: OrientDBClient;
  private pool: ODatabaseSessionPool;

  public async usingSession(func: (session: ODatabaseSession) => Promise<any>, options?: DbOperationOptions) {
    if (options?.session) {
      return func(options?.session);
    }

    const session = await this.acquireSession();
    try {
      return func(session);
    } finally {
      await session.close();
    }
  }

  public async usingTransaction<T>(
    transactionName: string,
    func: (options: DbOperationOptions) => Promise<T>,
    options?: DbOperationOptions
  ) {
    if (options?.session) {
      return func(options);
    }

    const session = await this.acquireSession();
    const dbOpOptions = {
      session,
    };
    const tx = session.begin();
    try {
      const returnValue = await func(dbOpOptions);
      await tx.commit(null);
      this.logger.info(`${transactionName} transaction succeeded`);
      return returnValue;
    } catch (e) {
      tx.rollback();
      this.logger.error(`${transactionName} transaction failed`, e);
      throw e;
    } finally {
      await session.close();
    }
  }

  public async acquireSession() {
    return this.pool.acquire();
  }

  public async close() {
    await this.pool.close();
    await this.client.close();
  }

  public async init() {
    const conf: any = {
      host: this.dbConfig.host,
      port: this.dbConfig.port,
      pool: {
        max: 10,
      },
    };

    if (this.dbConfig.useSSL) {
      conf.ssl = { enabled: true };
    }
    this.client = await OrientDBClient.connect(conf);

    this.pool = await this.client.sessions({
      name: this.dbConfig.databaseName,
      username: this.dbConfig.userName,
      password: this.dbConfig.userPassword,
      pool: {
        max: 25,
      },
    });
  }
}
