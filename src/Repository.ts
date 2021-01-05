import { getBeforeInsertHooks } from "./decorators/BeforeInsert";
import { getProperties } from "./decorators/Property";
import { VERTEX_METADATA_KEY } from "./decorators/Vertex";
import {
    ObjectType,
    FieldSelection,
    RecordTransformer,
    Logger,
    WhereCondition,
    DbFindOperationOptions,
    DbOperationOptions
} from "./types";
import { DbConnectionProvider } from "./DbConnectionProvider";

export class Repository<T> {
    public readonly vertexClassName: string;
    private vertexType: ObjectType<T>;
    private defaultExcludedFields: FieldSelection<T>;

    constructor(
        private logger: Logger,
        private recordTransformer: RecordTransformer,
        private dbConnectionProvider: DbConnectionProvider,
        vertexType: ObjectType<T>,
        defaultExcludedFields?: FieldSelection<T>
    ) {
        if (!Reflect.hasMetadata(VERTEX_METADATA_KEY, vertexType)) {
            throw new Error("Not a vertex");
        }
        this.vertexType = vertexType;
        const customVertexClassName = Reflect.getMetadata(VERTEX_METADATA_KEY, vertexType);
        this.vertexClassName = customVertexClassName || vertexType.name;
        this.defaultExcludedFields = defaultExcludedFields;
    }

    public create(doc: Partial<T>) {
        const obj = new this.vertexType();
        for (const prop of Object.keys(doc)) {
            obj[prop] = doc[prop];
        }
        return obj;
    }

    public async count(where?: WhereCondition<T>, options?: DbFindOperationOptions): Promise<number> {
        const dbConnection = await this.dbConnectionProvider.getConnection();
        return dbConnection.usingSession(async (session) => {
            let query = session.select("count(*)").from(this.vertexClassName);
            if (options?.let) {
                query = query.let(options.let.name, options.let.value);
            }
            if (where) {
                query = query.where(where);
            }
            return query.scalar();
        }, options);
    }

    public async find(
        where?: WhereCondition<T>,
        projection?: FieldSelection<T>,
        options?: DbFindOperationOptions,
        orderBy?: any
    ): Promise<T[]> {
        const dbConnection = await this.dbConnectionProvider.getConnection();
        return dbConnection
            .usingSession(async (session) => {
                let query = session.select(projection).from(this.vertexClassName);
                if (options?.let) {
                    query = query.let(options.let.name, options.let.value);
                }

                if (where) {
                    query = query.where(where);
                }

                if (orderBy) {
                    query = query.order(orderBy);
                }
                if (options?.skip > 0) {
                    query = query.skip(options.skip);
                }
                if (options?.limit > 0) {
                    query = query.limit(options.limit);
                }
                return query.transform(this.getRecordTransformer(projection)).all();
            }, options)
            .catch((e) => {
                this.logger.error(`Query error in ${this.vertexClassName}`, e);
                throw e;
            });
    }

    public async findOne(
        where?: WhereCondition<T>,
        projection?: FieldSelection<T>,
        options?: DbOperationOptions,
        orderBy?: any
    ): Promise<T> {
        const dbConnection = await this.dbConnectionProvider.getConnection();
        return dbConnection.usingSession(async (session) => {
            let query = session.select(projection).from(this.vertexClassName);
            if (where) {
                query = query.where(where);
            }
            if (orderBy) {
                query = query.order(orderBy);
            }
            return query.transform(this.getRecordTransformer(projection)).one();
        }, options);
    }

    public async findById(id: ObjectId, projection?: FieldSelection<T>, options?: DbOperationOptions): Promise<T> {
        const dbConnection = await this.dbConnectionProvider.getConnection();
        return dbConnection.usingSession(async (session) => {
            return session
                .select(projection)
                .from(this.vertexClassName)
                .where(`id = ${id}`)
                .transform(this.getRecordTransformer(projection))
                .one();
        }, options);
    }

    public async findByIds(
        ids: ObjectId[],
        projection?: FieldSelection<T>,
        options?: DbOperationOptions
    ): Promise<T[]> {
        if (!Array.isArray(ids)) {
            return [];
        }

        ids = ids.filter((id) => !!id);
        const dbConnection = await this.dbConnectionProvider.getConnection();
        return dbConnection.usingSession(async (session) => {
            return session
                .select(projection)
                .from(this.vertexClassName)
                .where(`id in [${ids.join()}]`)
                .transform(this.getRecordTransformer(projection))
                .all();
        }, options);
    }

    public async insert(entity: T, options?: DbOperationOptions): Promise<T> {
        const dbConnection = await this.dbConnectionProvider.getConnection();
        return dbConnection.usingSession(async (session) => {
            const beforeInsertHooks = getBeforeInsertHooks(entity);
            for (const hook of Object.keys(beforeInsertHooks)) {
                await entity[hook]();
            }
            const props = getProperties(entity);

            return session.insert().into(this.vertexClassName).set(props).transform(this.getRecordTransformer()).one();
        }, options);
    }

    public async update(entity: T, options?: DbOperationOptions): Promise<T> {
        const dbConnection = await this.dbConnectionProvider.getConnection();
        const id = entity["@rid"];
        return dbConnection.usingSession(async (session) => {
            const props = getProperties(entity);
            (props as any).updated_at = new Date();
            this.logger.info("update: ", props);
            return session.update(id).set(props).return("AFTER").transform(this.getRecordTransformer()).one();
        }, options);
    }

    public async updateFields(
        entity: T | ObjectId,
        fieldsToUpdate: Partial<T>,
        options?: DbOperationOptions
    ): Promise<T> {
        const dbConnection = await this.dbConnectionProvider.getConnection();
        const rid = entity["@rid"];
        const id = (entity as any).id || (entity as ObjectId);
        (fieldsToUpdate as any).updated_at = new Date();
        return dbConnection.usingSession(async (session) => {
            const query = rid
                ? session.update(rid).set(fieldsToUpdate).return("AFTER").transform(this.getRecordTransformer())
                : session
                      .update(this.vertexClassName)
                      .set(fieldsToUpdate)
                      .where("id=" + id)
                      .return("AFTER")
                      .transform(this.getRecordTransformer());
            return query.one();
        }, options);
    }

    public async deleteById(id: ObjectId, options?: DbOperationOptions): Promise<boolean> {
        const dbConnection = await this.dbConnectionProvider.getConnection();
        return dbConnection.usingSession(async (session) => {
            const deletedRecordCount = await session
                .delete("VERTEX")
                .from(this.vertexClassName)
                .where(`id = ${id}`)
                .limit(1)
                .scalar();

            return deletedRecordCount > 0;
        }, options);
    }

    public async deleteMany(where?: WhereCondition<T>, options?: DbOperationOptions): Promise<boolean> {
        const dbConnection = await this.dbConnectionProvider.getConnection();
        return dbConnection.usingSession(async (session) => {
            let query = session.delete("VERTEX").from(this.vertexClassName);
            if (where) {
                query = query.where(where);
            }
            return query.scalar();
        }, options);
    }

    private getRecordTransformer(projection?: FieldSelection<T>) {
        const thisRepo = this;
        const defaultExcludedFields = this.defaultExcludedFields;
        return (r) => {
            r = this.recordTransformer.transformRecord(r);
            if (r && !projection && defaultExcludedFields) {
                for (const key of defaultExcludedFields) {
                    delete r[key];
                }
            }
            return thisRepo.create(r);
        };
    }
}
