import jwt, { type SignOptions } from "jsonwebtoken";
import { BadRequestError } from "../errors/bad-request-error.js";
import type { IJwtPayload } from "../types/jwt.js";



class JWTToken {


    createJWT(payload: IJwtPayload, key: string, expiresIn: SignOptions["expiresIn"] = "1y") {

        const verifyToken = jwt.sign(payload, key, {
            expiresIn
        });
        return verifyToken;
    }


    verifyJwt(token: string, key: string): Promise<IJwtPayload> {

        return new Promise((resolve, reject) => {
            jwt.verify(token, key, (err, decoded) => {
                if (err) {

                    reject(new BadRequestError("in valid token..!"));
                } else {

                    resolve(decoded as IJwtPayload);
                }
            });
        });

    }

}

export const jWTToken = new JWTToken();