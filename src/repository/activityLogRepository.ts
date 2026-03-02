import ActivityLogModal from "../model/activityLog.js";
import type { IActivityLog } from "../types/data.js";

class ActivityLogRepository {
    async createActivityLog(activityLogData: IActivityLog) {

        const newActivityLog = await ActivityLogModal.create(activityLogData);
        return await newActivityLog.save();
    }
}

export const activityLogRepository = new ActivityLogRepository();