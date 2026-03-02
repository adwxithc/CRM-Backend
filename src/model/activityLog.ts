import mongoose, { Schema, type Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import type { IActivityLog, PaginateOptions, PaginateResult } from "../types/data.js";

export type PaginateModel<T> = Model<T> & {
    paginate(query?: Record<string, unknown>, options?: PaginateOptions): Promise<PaginateResult<T>>;
};
//


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

activityLogSchema.plugin(mongoosePaginate);

const ActivityLogModel = mongoose.model<IActivityLog, PaginateModel<IActivityLog>>("ActivityLog", activityLogSchema);

export default ActivityLogModel;
