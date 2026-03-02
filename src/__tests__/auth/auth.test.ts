import request from "supertest";
import { app } from "../../app.js";
import { clearTestDB, closeTestDB, connectTestDB } from "./setup.js";
import { VALID_USER } from "./fixtures.js";
import { getAuthCookie, loginUser, registerUser } from "../helpers/auth.js";


beforeAll(async () => {
    process.env.JWT_KEY = "test-jwt-secret";
    process.env.JWT_REFRESH_KEY = "test-refresh-secret";
    process.env.ACCESS_TOKEN_EXPIRE = "1h";
    process.env.REFRESH_TOKEN_EXPIRE = "30d";

    await connectTestDB();
});

afterEach(clearTestDB);

afterAll(closeTestDB);

// ─── POST /api/auth/register ──────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
    it("returns 201 and user data on valid input", async () => {
        const res = await registerUser();

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toMatch(/account created/i);
        expect(res.body.data).toMatchObject({
            name: VALID_USER.name,
            email: VALID_USER.email,
        });
        // Password must never be returned
        expect(res.body.data.password).toBeUndefined();
    });

    it("returns 400 when email is already registered", async () => {
        await registerUser(); // first registration
        const res = await registerUser(); // duplicate

        expect(res.status).toBe(400);
        expect(res.body.errors[0].message).toMatch(/already exist/i);
    });

    it("returns 400 when name is missing", async () => {
        const res = await registerUser({ name: undefined });

        expect(res.status).toBe(400);
        expect(
            res.body.errors.some((e: { field: string }) => e.field === "name")
        ).toBe(true);
    });

    it("returns 400 for an invalid email format", async () => {
        const res = await registerUser({ email: "not-an-email" });

        expect(res.status).toBe(400);
        expect(
            res.body.errors.some((e: { field: string }) => e.field === "email")
        ).toBe(true);
    });

    it("returns 400 for password shorter than 6 characters", async () => {
        const res = await registerUser({ password: "T@1" });

        expect(res.status).toBe(400);
        expect(
            res.body.errors.some(
                (e: { field: string }) => e.field === "password"
            )
        ).toBe(true);
    });

    it("returns 400 for password without a special character", async () => {
        const res = await registerUser({ password: "Test1234" });

        expect(res.status).toBe(400);
        expect(
            res.body.errors.some(
                (e: { field: string }) => e.field === "password"
            )
        ).toBe(true);
    });

    it("returns 400 for password without a number", async () => {
        const res = await registerUser({ password: "Test@abc" });

        expect(res.status).toBe(400);
        expect(
            res.body.errors.some(
                (e: { field: string }) => e.field === "password"
            )
        ).toBe(true);
    });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
    beforeEach(async () => {
        // Seed the database with a registered user before each login test
        await registerUser();
    });

    it("returns 200 and user data on valid credentials", async () => {
        const res = await loginUser();

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toMatchObject({
            name: VALID_USER.name,
            email: VALID_USER.email,
        });
        expect(res.body.data.password).toBeUndefined();
    });

    it("sets accessToken and refreshToken cookies on successful login", async () => {
        const res = await loginUser();

        const cookies = (res.headers["set-cookie"] as unknown as string[]) ?? [];
        const cookieStr = cookies.join("; ");

        expect(cookieStr).toMatch(/accessToken/);
        expect(cookieStr).toMatch(/refreshToken/);
        // Cookies must be httpOnly
        expect(cookieStr.toLowerCase()).toMatch(/httponly/);
    });

    it("returns 400 for a non-existent email", async () => {
        const res = await loginUser({ email: "nobody@example.com" });

        expect(res.status).toBe(400);
        expect(res.body.errors[0].message).toMatch(/invalid email or password/i);
    });

    it("returns 400 for a wrong password", async () => {
        const res = await loginUser({ password: "Wrong@123" });

        expect(res.status).toBe(400);
        expect(res.body.errors[0].message).toMatch(/invalid email or password/i);
    });

    it("returns 400 for an invalid email format", async () => {
        const res = await loginUser({ email: "not-an-email" });

        expect(res.status).toBe(400);
        expect(
            res.body.errors.some((e: { field: string }) => e.field === "email")
        ).toBe(true);
    });

    it("returns 400 for a password shorter than 6 characters", async () => {
        const res = await loginUser({ password: "T@1" });

        expect(res.status).toBe(400);
        expect(
            res.body.errors.some(
                (e: { field: string }) => e.field === "password"
            )
        ).toBe(true);
    });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

describe("GET /api/auth/me", () => {
    it("returns 200 and user data when authenticated", async () => {
        const cookie = await getAuthCookie();
        const res = await request(app).get("/api/auth/me").set("Cookie", cookie);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toMatchObject({
            name: VALID_USER.name,
            email: VALID_USER.email,
        });
        expect(res.body.data.password).toBeUndefined();
    });

    it("returns 4xx when not authenticated", async () => {
        const res = await request(app).get("/api/auth/me");
        expect(res.status).toBeGreaterThanOrEqual(400);
    });
});
