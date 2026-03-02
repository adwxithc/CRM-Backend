import request from "supertest";
import { app } from "../../app.js";
import { clearTestDB, closeTestDB, connectTestDB } from "../auth/setup.js";

// Rate limit is active in this file — DISABLE_RATE_LIMIT is intentionally NOT set

beforeAll(async () => {
    process.env.JWT_KEY = "test-jwt-secret";
    process.env.JWT_REFRESH_KEY = "test-refresh-secret";
    process.env.ACCESS_TOKEN_EXPIRE = "1h";
    process.env.REFRESH_TOKEN_EXPIRE = "30d";
    // Do NOT set DISABLE_RATE_LIMIT so the limiter is active

    await connectTestDB();
});

afterEach(clearTestDB);
afterAll(closeTestDB);

// ─── Login rate limiter ───────────────────────────────────────────────────────

describe("POST /api/auth/login — rate limiting", () => {
    const attemptLogin = () =>
        request(app)
            .post("/api/auth/login")
            .send({ email: "anyone@example.com", password: "Any@1234" });

    it("allows up to 3 requests then blocks with 429 on the 4th", async () => {
        // First 3 attempts are allowed through (may return 400 for bad credentials — that's fine)
        for (let i = 0; i < 3; i++) {
            const res = await attemptLogin();
            expect(res.status).not.toBe(429);
        }

        // 4th attempt within the same window must be rate-limited
        const res = await attemptLogin();
        expect(res.status).toBe(429);
        expect(res.body.errors[0].message).toMatch(/too many login attempts/i);
    });
});
