import mongoose, { Schema } from "mongoose";
import type { IContact } from "../types/data.js";



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
            enum: ['Lead', 'Prospect', 'Customer'],
            required: true,
        },
        notes: {
            type: String,
            required: true,
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

const ContactModel = mongoose.model<IContact>("Contact", contactSchema);


export default ContactModel;
