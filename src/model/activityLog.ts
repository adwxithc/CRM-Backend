import mongoose, { Schema } from "mongoose";
import type { IActivityLog, IContact } from "../types/data.js";



const activityLogSchema = new Schema<IActivityLog>(
    {
        action: {
            type: String,
            enum: ['ADD', 'EDIT', 'DELETE'],
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        contact: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contact",
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                const { _id, __v: _unused, ...rest } = ret;

                return {
                    id: _id.toString(),
                    ...rest,
                };
            },
        },
    }
);

const ActivityLogModel = mongoose.model<IActivityLog>("ActivityLog", activityLogSchema);


export default ActivityLogModel;
