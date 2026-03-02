import type { Router } from "express";
import {
    createContactValidations,
    editContactValidations,
    contactIdParamValidation,
    getContactsQueryValidation,
} from "../validations/contactValidations.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import protect from '../middlewares/authMiddleware.js';
import { contactController } from "../controller/contactController.js";

export function contactRouter(router: Router) {

    router.post(
        "/",
        protect.protectUser,
        createContactValidations,
        validateRequest,
        contactController.createContact
    );

    router.put(
        "/:id",
        protect.protectUser,
        contactIdParamValidation,
        editContactValidations,
        validateRequest,
        contactController.editContact
    );

    router.delete(
        "/:id",
        protect.protectUser,
        contactIdParamValidation,
        validateRequest,
        contactController.deleteContact
    );

    router.get(
        "/",
        protect.protectUser,
        getContactsQueryValidation,
        validateRequest,
        contactController.getContacts
    );

    return router;
}