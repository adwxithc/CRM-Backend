import type { Types } from "mongoose";
import ContactModel from "../model/contactModel.js";
import type { IContact } from "../types/data.js";

class ContactRepository {
    async createContact(contactData: IContact) {
        const newContact = await ContactModel.create(contactData);
        return await newContact.save();
    }

    async findByEmail(email: string) {
        return await ContactModel.findOne({ email, isDeleted: false });
    }

    async findById(id: Types.ObjectId) {
        return await ContactModel.findOne({ _id: id, isDeleted: false });
    }

    async updateContact(id: Types.ObjectId, data: Partial<IContact>) {
        return await ContactModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { $set: data },
            { new: true }
        );
    }

    async softDeleteContact(id: Types.ObjectId) {
        return await ContactModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { $set: { isDeleted: true } },
            { new: true }
        );
    }

    async getContacts({
        createdBy,
        page = 1,
        limit = 10,
        search,
        status,
    }: {
        createdBy: Types.ObjectId;
        page?: number;
        limit?: number;
        search?: string;
        status?: IContact['status'];
    }) {
        const filter: Record<string, unknown> = { createdBy, isDeleted: false };

        if (status) {
            filter['status'] = status;
        }

        if (search) {
            const regex = new RegExp(search, 'i');
            filter['$or'] = [
                { name: regex },
                { email: regex },
                { company: regex },
            ];
        }

        const result = await ContactModel.paginate(filter, {
            page,
            limit,
            sort: { createdAt: -1 },
            lean: false,
        });

        return result;
    }
}

export const contactRepository = new ContactRepository();