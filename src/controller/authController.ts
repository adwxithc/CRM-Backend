import { BadRequestError } from "../errors/bad-request-error.js";
import userRepository from "../repository/userRepository.js";
import { hash } from "../services/hash.js";
import type { RegisterDTO } from "../types/data.js";
import type { Req, Res } from "../types/expressTypes.js";

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
            message: "user created"
        });
    }
}

export const authController = new AuthController();