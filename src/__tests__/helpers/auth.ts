import request from "supertest";
import { app } from "../../app.js";
import { VALID_USER } from "../auth/fixtures.js";


export const registerUser = (overrides: Record<string, unknown> = {}) =>
    request(app)
        .post("/api/auth/register")
        .send({ ...VALID_USER, ...overrides });


export const loginUser = (overrides: Record<string, unknown> = {}) =>
    request(app)
        .post("/api/auth/login")
        .send({
            email: VALID_USER.email,
            password: VALID_USER.password,
            ...overrides,
        });


interface UserOverrides extends Record<string, unknown> {
    name?: string;
    email?: string;
    password?: string;
}

export const getAuthCookie = async (
    overrides: UserOverrides = {}
): Promise<string> => {
    await registerUser(overrides);

    const res = await loginUser({
        email: overrides.email ?? VALID_USER.email,
        password: overrides.password ?? VALID_USER.password,
    });

    const cookies = (res.headers["set-cookie"] as unknown as string[]) ?? [];
    const cookie = cookies.find((c) => c.startsWith("accessToken="));
    if (!cookie) throw new Error("accessToken cookie not found after login");
    return cookie;
};
