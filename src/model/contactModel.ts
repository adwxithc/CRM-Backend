import mongoose, { Schema, type Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { STATUS_VALUES } from "../constants/contact.js";
import type { IContact, PaginateOptions, PaginateResult } from "../types/data.js";


export type PaginateModel<T> = Model<T> & {
    paginate(query?: Record<string, unknown>, options?: PaginateOptions): Promise<PaginateResult<T>>;
};



const contactSchema = new Schema<IContact>(
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
        phone: {
            type: String,
            required: true,
        },
        company: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: STATUS_VALUES,
            required: true,
        },
        notes: {
            type: String,
            required: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
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

contactSchema.plugin(mongoosePaginate);

const ContactModel = mongoose.model<IContact, PaginateModel<IContact>>("Contact", contactSchema);

export default ContactModel;
