
import { validationResult } from "express-validator";
import { RequestValidationError } from "../errors/request-validation-error.js";
import type { Next, Req, Res } from "../types/expressTypes.js";

export const validateRequest = (
    req: Req,
    res: Res,
    next: Next
) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new RequestValidationError(errors.array());
    }

    next();
};
