export interface VertexId {
    readonly "@rid": string;
    readonly id: ObjectId;
}

export interface UserId extends VertexId {
    readonly org_id: ObjectId;
}
