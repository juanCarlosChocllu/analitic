import { Types } from "mongoose";

export interface requestUserI{
    sub: Types.ObjectId, 
    username: string,
    id: Types.ObjectId
}