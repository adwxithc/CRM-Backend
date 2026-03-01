import type { SignOptions } from "jsonwebtoken";
import { BadRequestError } from "../errors/bad-request-error.js";
import userRepository from "../repository/userRepository.js";
import { hash } from "../services/hash.js";
import { jWTToken } from "../services/jwt.js";
import type { RegisterDTO } from "../types/data.js";
import type { Req, Res } from "../types/expressTypes.js";
import { accessTokenOptions, refreshTokenOptions } from "../utils/tockenOptions.js";

class AuthController {
    async register(req: Req, res: Res) {
        const { name, email, password } = req.body as RegisterDTO;

        const exist = await userRepository.findByEmail(email);

        if (exist) {
            throw new BadRequestError(
                "user already exist with the same mail id please login"
            );
        }
        const hashPassword = await hash.createHash(password);
        const newUser = {
            name,
            email,
            password: hashPassword
        }

        await userRepository.createUser(newUser);

        res.status(201).json({
            data: {
                name,
                email,
            },
            success: true,
            message: "Account created, please login with your email and password"
        });
    }

    async login(req: Req, res: Res) {
        const { email, password } = req.body as {
            email: string;
            password: string;
        };

        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new BadRequestError("invalid email or password");
        }

        const passwordMatch = await hash.comparePassword(
            password,
            user.password!
        );

        if (!passwordMatch) {
            throw new BadRequestError("invalid email or password");
        }
        const accessTokenExpiresIn = (process.env.ACCESS_TOKEN_EXPIRE ?? "1h") as SignOptions["expiresIn"];
        const refreshTokenExpiresIn = (process.env.REFRESH_TOKEN_EXPIRE ?? "30d") as SignOptions["expiresIn"];

        const accessToken = jWTToken.createJWT(
            { email },
            process.env.JWT_KEY as string,
            accessTokenExpiresIn
        );

        const refreshToken = jWTToken.createJWT(
            { email },
            process.env.JWT_REFRESH_KEY as string,
            refreshTokenExpiresIn
        );

        res.cookie("refreshToken", refreshToken, refreshTokenOptions);
        res.cookie("accessToken", accessToken, accessTokenOptions);

        res.json({
            success: true,
            data: { name: user.name, email },
        });
    }
}

export const authController = new AuthController();