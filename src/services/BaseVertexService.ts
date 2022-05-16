import { ExceptionType } from '../ExceptionType';
import { getOrientdbConnection } from '../models';
import { BaseVertex } from "../models/BaseVertex";
import { Repository } from '../Repository';
import { DbOperationOptions } from '../types';
import { AppCode } from "../types/AppCode";
import { AppError } from "../types/AppError";

interface CompositeId {
    id: number;
    org_id?: number;
}

export abstract class BaseVertexService<T extends BaseVertex> {
    constructor(public repository: Repository<T>) { }

    protected async usingTransaction(transactionName: string, func: (options: DbOperationOptions) => Promise<any>, options?: DbOperationOptions) {
        const dbConnection = await getOrientdbConnection();
        return dbConnection.usingTransaction(transactionName, func, options);
    }

    public async getById(query: CompositeId): Promise<T> {
        let vertex;
        if (query.org_id) {
            vertex = await this.repository.findOne(query as any);
        } else {
            vertex = await this.repository.findById(query.id);
        }
        if (!vertex) {
            throw new AppError(AppCode.VertexNotFound, this.repository.vertexClassName);
        }
        return vertex;
    }

    public async getAllByIds(query: { org_id: number; idArr: number[] }): Promise<T[]> {
        const filter = [`id in [${query.idArr.join(",")}]`];
        if (query.org_id) {
            filter.push(`org_id=${query.org_id}`);
        }
        return this.repository.find(filter.join(" AND "));
    }

    public async getAll(query?: { org_id?: number; q?: string }): Promise<T[]> {
        const filter = [];
        if (query?.q) {
            filter.push(`name.toLowerCase() like '%${query.q.toLowerCase()}%'`);
        }
        if (query?.org_id) {
            filter.push(`org_id=${query.org_id}`);
        }
        return this.repository.find(filter.join(" AND "));
    }

    public async add(org_id: number, payload: Partial<T>, options?: DbOperationOptions): Promise<T> {
        const vertexDoc = this.repository.create({
            ...payload,
            org_id
        });

        return this.repository.insert(vertexDoc, options);
    }

    public async update(id: ObjectId, payload: Partial<T>, options?: DbOperationOptions): Promise<T> {
        try {
            const v = await this.repository.updateFields(id, payload, options);
            return v;
        } catch (e) {
            if (e.type === ExceptionType.RecordDuplicated) {
                throw new AppError(AppCode.VertexAlreadyExists, this.repository.vertexClassName);
            }
            throw e;
        }
    }

    public async deleteById(compId: CompositeId): Promise<boolean> {
        try {
            const v = await this.getById(compId);
            return this.repository.deleteById(compId.id);
        } catch (error) {
            return false;
        }
    }
}
