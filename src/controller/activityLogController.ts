import { BadRequestError } from "../errors/bad-request-error.js";
import { activityLogRepository } from "../repository/activityLogRepository.js";
import type { Req, Res } from "../types/expressTypes.js";
import { toObjectId } from "../utils/toObjectId.js";

class ActivityLogController {
    async getActivityLogs(req: Req, res: Res) {
        const user = toObjectId(req.user?.id);
        if (!user) throw new BadRequestError("User not found");

        const page = Number(req.query?.page) || 1;
        const limit = Number(req.query?.limit) || 10;

        const result = await activityLogRepository.getActivityLogs({ user, page, limit });

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

export const activityLogController = new ActivityLogController();
