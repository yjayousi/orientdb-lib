import { DBShell } from '../DbShell';
import { orientdbContainer } from '../models';
import { DbOperationOptions } from '../types';
import { UserId, VertexId } from '../types/UserId';

const dbShell = orientdbContainer.get(DBShell);

export class EdgeHelper {
    public static async creatEdge(
        user: UserId,
        edge: string,
        fromVertex: VertexId,
        toVertex: VertexId,
        dbOpOptions?: DbOperationOptions
    ): Promise<boolean> {
        await dbShell.executeCommand(
            `CREATE EDGE ${edge} FROM ${fromVertex["@rid"]} TO ${toVertex["@rid"]} SET created_by=${user?.id}, created_at=sysdate()`,
            dbOpOptions
        );
        return true;
    }

    public static async creatEdgeIfNotExists(
        user: UserId,
        edge: string,
        fromVertex: VertexId,
        toVertex: VertexId,
        dbOpOptions?: DbOperationOptions
    ): Promise<boolean> {
        if (!(await EdgeHelper.edgeExists(edge, fromVertex, toVertex, dbOpOptions))) {
            return EdgeHelper.creatEdge(user, edge, fromVertex, toVertex, dbOpOptions);
        }
        return false;
    }

    public static async creatEdgeWithPropsIfNotExists(
        user: UserId,
        edge: string,
        fromVertex: VertexId,
        toVertex: VertexId,
        props: unknown,
        dbOpOptions?: DbOperationOptions
    ): Promise<boolean> {
        if (!(await EdgeHelper.edgeExists(edge, fromVertex, toVertex, dbOpOptions))) {
            return EdgeHelper.creatEdgeWithProps(user, edge, fromVertex, toVertex, props, dbOpOptions);
        }
        return false;
    }

    public static async creatEdgeWithProps(
        user: UserId,
        edge: string,
        fromVertex: VertexId,
        toVertex: VertexId,
        props: unknown,
        dbOpOptions?: DbOperationOptions
    ): Promise<boolean> {
        (props as any).created_at = Date.now();
        (props as any).created_by = user?.id;
        await dbShell.executeCommand(
            `CREATE EDGE ${edge} FROM ${fromVertex["@rid"]} TO ${toVertex["@rid"]} CONTENT ${JSON.stringify(props)} `,
            dbOpOptions
        );
        return true;
    }

    public static async updateEdgeProps(
        user: UserId,
        edge: string,
        fromVertex: VertexId,
        toVertex: VertexId,
        props: unknown,
        dbOpOptions?: DbOperationOptions
    ): Promise<boolean> {
        (props as any).last_update_at = Date.now();
        (props as any).last_update_by = user?.id;
        await dbShell.executeCommand(
            `UPDATE EDGE (SELECT FROM ${edge} WHERE out=${fromVertex["@rid"]} AND in=${toVertex["@rid"]}) MERGE ${JSON.stringify(props)}`,
            dbOpOptions
        );
        return true;
    }

    public static async deleteEdge(
        user: UserId,
        edge: string,
        fromVertex: VertexId,
        toVertex: VertexId,
        dbOpOptions?: DbOperationOptions
    ): Promise<boolean> {
        /*
        dbShell.executeCommand(
            `UPDATE EDGE  (SELECT FROM ${edge} WHERE out=${fromVertex["@rid"]} AND in=${toVertex["@rid"]}) SET deleted=true, deleted_at=sysdate(), deleted_by=${user.id}`,
            dbOpOptions
        );
        return true;
        */
        await dbShell.executeCommand(`DELETE EDGE FROM ${fromVertex["@rid"]} TO ${toVertex["@rid"]} WHERE @class = "${edge}"`, dbOpOptions);
        return true;
    }

    public static async edgeExists(edge: string, fromVertex: VertexId, toVertex: VertexId, dbOpOptions?: DbOperationOptions): Promise<boolean> {
        const edges = await dbShell.executeQuery(`SELECT FROM ${edge} WHERE out=${fromVertex["@rid"]} AND in=${toVertex["@rid"]}`, dbOpOptions);
        return edges.length > 0;
    }
}
