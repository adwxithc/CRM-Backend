import type { Next, Req, Res } from '../types/expressTypes.js';

import { ForbiddenRequestError } from '../errors/forbidden-request-error.js';
import type { IJwtPayload } from '../types/jwt.js';
import { jWTToken } from '../services/jwt.js';

declare module 'express' {
    export interface Request {
        user?: IJwtPayload;
    }
}
interface IProtect {
    protectUser(req: Req, res: Res, next: Next): Promise<void>;
}

class Protect implements IProtect {
    
   

    protectUser = async (req: Req, res: Res, next: Next) => {
        const token = req.cookies.accessToken;
        if (!token) throw new ForbiddenRequestError();
        const decoded = await jWTToken.verifyJwt(token,process.env.JWT_KEY as string);

        if (decoded?.email && decoded?.id) {
            req.user = decoded;
            return next();
        }

        throw new ForbiddenRequestError();
    };

 
}

export default new Protect()
