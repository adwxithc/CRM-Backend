import type { Types } from "mongoose";
import ActivityLogModal from "../model/activityLog.js";
import type { IActivityLog } from "../types/data.js";

class ActivityLogRepository {
    async createActivityLog(activityLogData: IActivityLog) {
        const newActivityLog = await ActivityLogModal.create(activityLogData);
        return await newActivityLog.save();
    }

    async getActivityLogs({
        user,
        page = 1,
        limit = 10,
    }: {
        user: Types.ObjectId;
        page?: number;
        limit?: number;
    }) {
        return await ActivityLogModal.paginate(
            { user },
            {
                page,
                limit,
                sort: { createdAt: -1 },
                lean: false,
                populate: { path: "contact", select: "name email" },
            }
        );
    }
}

export const activityLogRepository = new ActivityLogRepository();