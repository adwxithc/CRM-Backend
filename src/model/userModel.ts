import mongoose, { Schema } from "mongoose";
import type { IUser } from "../types/data.js";



const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,

        },
        email: {
            type: String,
            required: true,
            unique: true
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                const { _id, __v:_unused, ...rest } = ret;

                return {
                    id: _id.toString(),
                    ...rest,
                };
            },
        },
    }
);

const UserModel = mongoose.model<IUser>("User", userSchema);


export default UserModel;
