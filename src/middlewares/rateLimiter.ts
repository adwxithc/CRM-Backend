import rateLimit from "express-rate-limit";
import { TooManyRequestsError } from "../errors/too-many-requests-error.js";
import type { Next, Req, Res } from "../types/expressTypes.js";

export const loginRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 3,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: () => process.env.DISABLE_RATE_LIMIT === "true",
    handler: (_req: Req, _res: Res, next: Next) => {
        next(new TooManyRequestsError("Too many login attempts, please try again after 10 minutes"));
    },
});
