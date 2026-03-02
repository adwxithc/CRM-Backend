import { ActionEnum } from "../constants/contact.js";
import { BadRequestError } from "../errors/bad-request-error.js";
import { ForbiddenRequestError } from "../errors/forbidden-request-error.js";
import { activityLogRepository } from "../repository/activityLogRepository.js";
import { contactRepository } from "../repository/contactRepository.js";
import type { IContact } from "../types/data.js";
import type { Req, Res } from "../types/expressTypes.js";
import { toObjectId } from "../utils/toObjectId.js";

class ContactController {
    async createContact(req: Req, res: Res) {
        const { name, email, phone, company, status, notes } = req.body;

        const createdBy = toObjectId(req.user?.id as string);
        if (!createdBy) throw new BadRequestError("User not found");

        const contactData: IContact = { name, email, phone, company, status, notes, createdBy };
        const newContact = await contactRepository.createContact(contactData);

        await activityLogRepository.createActivityLog({
            action: ActionEnum.ADD,
            user: createdBy,
            contact: newContact.id,
        });

        res.status(201).json({
            data: newContact,
            success: true,
            message: "Contact created successfully",
        });
    }

    async editContact(req: Req, res: Res) {
        const id = toObjectId(req.params["id"] as string | undefined);
        if (!id) throw new BadRequestError("Invalid contact id");

        const contact = await contactRepository.findById(id);
        if (!contact) throw new BadRequestError("Contact not exist");

        if (contact.createdBy.toString() !== req.user?.id) {
            throw new ForbiddenRequestError();
        }

        const userId = toObjectId(req.user?.id);
        if (!userId) throw new BadRequestError("User not found");

        const { name, email, phone, company, status, notes } = req.body as Partial<IContact>;
        const updates: Partial<IContact> = {};
        if (name !== undefined) updates.name = name;
        if (email !== undefined) updates.email = email;
        if (phone !== undefined) updates.phone = phone;
        if (company !== undefined) updates.company = company;
        if (status !== undefined) updates.status = status;
        if (notes !== undefined) updates.notes = notes;

        const updated = await contactRepository.updateContact(id, updates);


        await activityLogRepository.createActivityLog({
            action: ActionEnum.EDIT,
            user: userId,
            contact: id,
        });

        res.json({
            data: updated,
            success: true,
            message: "Contact updated successfully",
        });
    }

    async deleteContact(req: Req, res: Res) {
        const id = toObjectId(req.params["id"] as string | undefined);
        if (!id) throw new BadRequestError("Invalid contact id");

        const contact = await contactRepository.findById(id);
        if (!contact) throw new BadRequestError("Contact not found");

        if (contact.createdBy.toString() !== req.user?.id) {
            throw new ForbiddenRequestError();
        }

        await contactRepository.softDeleteContact(id);

        const userId = toObjectId(req.user?.id);
        if (!userId) throw new BadRequestError("User not found");
        await activityLogRepository.createActivityLog({
            action: ActionEnum.DELETE,
            user: userId,
            contact: id,
        });

        res.json({
            success: true,
            message: "Contact deleted successfully",
        });
    }

    async getContacts(req: Req, res: Res) {
        const createdBy = toObjectId(req.user?.id);
        if (!createdBy) throw new BadRequestError("User not found");

        const page = Number(req.query?.page) || 1;
        const limit = Number(req.query?.limit) || 10;
        const search = req.query?.search as string | undefined;
        const status = req.query?.status as IContact["status"] | undefined;

        const result = await contactRepository.getContacts({
            createdBy,
            page,
            limit,
            ...(search !== undefined && { search }),
            ...(status !== undefined && { status }),
        });

        res.json({
            data: result.docs,
            pagination: {
                total: result.totalDocs,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
                hasNextPage: result.hasNextPage,
                hasPrevPage: result.hasPrevPage,
            },
            success: true,
        });
    }
}

export const contactController = new ContactController();