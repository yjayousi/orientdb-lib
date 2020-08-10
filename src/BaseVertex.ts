import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export abstract class BaseVertex {
    public readonly "@rid": string;

    @Field(/*type => ID,*/ { nullable: true })
    public readonly id: ObjectId;

    public _id: string;

    @Field()
    public readonly create_dt: Date;
}
