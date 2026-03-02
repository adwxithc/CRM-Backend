import type { Router } from "express";
import protect from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { activityLogController } from "../controller/activityLogController.js";
import { getActivityLogsQueryValidation } from "../validations/activityLogValidations.js";

export function activityLogRouter(router: Router) {
    router.get(
        "/",
        protect.protectUser,
        getActivityLogsQueryValidation,
        validateRequest,
        activityLogController.getActivityLogs
    );

    return router;
}
