import request from "supertest";
import { app } from "../../app.js";
import { clearTestDB, closeTestDB, connectTestDB } from "./setup.js";
import { VALID_CONTACT } from "./fixtures.js";
import { getAuthCookie } from "../helpers/auth.js";
import { StatusEnum } from "../../constants/contact.js";

beforeAll(async () => {
    process.env.JWT_KEY = "test-jwt-secret";
    process.env.JWT_REFRESH_KEY = "test-refresh-secret";
    process.env.ACCESS_TOKEN_EXPIRE = "1h";
    process.env.REFRESH_TOKEN_EXPIRE = "30d";
    process.env.DISABLE_RATE_LIMIT = "true";

    await connectTestDB();
});

afterEach(clearTestDB);

afterAll(closeTestDB);

// ─── Request helpers ──────────────────────────────────────────────────────────

const createContact = (cookie: string, overrides: Record<string, unknown> = {}) =>
    request(app)
        .post("/api/contact/")
        .set("Cookie", cookie)
        .send({ ...VALID_CONTACT, ...overrides });

// ─── POST /api/contact/ ───────────────────────────────────────────────────────

describe("POST /api/contact/", () => {
    let cookie: string;

    beforeEach(async () => {
        cookie = await getAuthCookie();
    });

    it("returns 201 and contact data on valid input", async () => {
        const res = await createContact(cookie);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toMatch(/contact created/i);
        expect(res.body.data).toMatchObject({
            name: VALID_CONTACT.name,
            email: VALID_CONTACT.email,
            company: VALID_CONTACT.company,
            status: StatusEnum.LEAD,
        });
    });

    it("returns 401/403 when not authenticated", async () => {
        const res = await request(app).post("/api/contact/").send(VALID_CONTACT);
        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("returns 400 when name is missing", async () => {
        const res = await createContact(cookie, { name: undefined });

        expect(res.status).toBe(400);
        expect(res.body.errors.some((e: { field: string }) => e.field === "name")).toBe(true);
    });

    it("returns 400 for an invalid email", async () => {
        const res = await createContact(cookie, { email: "not-an-email" });

        expect(res.status).toBe(400);
        expect(res.body.errors.some((e: { field: string }) => e.field === "email")).toBe(true);
    });

    it("returns 400 for an invalid phone number", async () => {
        const res = await createContact(cookie, { phone: "abc" });

        expect(res.status).toBe(400);
        expect(res.body.errors.some((e: { field: string }) => e.field === "phone")).toBe(true);
    });

    it("returns 400 for an invalid status", async () => {
        const res = await createContact(cookie, { status: "InvalidStatus" });

        expect(res.status).toBe(400);
        expect(res.body.errors.some((e: { field: string }) => e.field === "status")).toBe(true);
    });
});

// ─── PUT /api/contact/:id ─────────────────────────────────────────────────────

describe("PUT /api/contact/:id", () => {
    let cookie: string;
    let contactId: string;

    beforeEach(async () => {
        cookie = await getAuthCookie();
        const res = await createContact(cookie);
        contactId = res.body.data.id as string;
    });

    it("returns 200 and updated data on valid input", async () => {
        const res = await request(app)
            .put(`/api/contact/${contactId}`)
            .set("Cookie", cookie)
            .send({ name: "Jane Doe", status: StatusEnum.CUSTOMER });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe("Jane Doe");
        expect(res.body.data.status).toBe(StatusEnum.CUSTOMER);
    });

    it("returns 401/403 when not authenticated", async () => {
        const res = await request(app)
            .put(`/api/contact/${contactId}`)
            .send({ name: "Jane Doe" });

        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("returns 403 when editing another user's contact", async () => {
        const otherCookie = await getAuthCookie({ email: "other@example.com" });

        const res = await request(app)
            .put(`/api/contact/${contactId}`)
            .set("Cookie", otherCookie)
            .send({ name: "Hijacked" });

        expect(res.status).toBe(403);
    });

    it("returns 400 for an invalid contact id", async () => {
        const res = await request(app)
            .put("/api/contact/invalid-id")
            .set("Cookie", cookie)
            .send({ name: "Jane Doe" });

        expect(res.status).toBe(400);
        expect(res.body.errors.some((e: { field: string }) => e.field === "id")).toBe(true);
    });

    it("returns 400 for an invalid status value", async () => {
        const res = await request(app)
            .put(`/api/contact/${contactId}`)
            .set("Cookie", cookie)
            .send({ status: "InvalidStatus" });

        expect(res.status).toBe(400);
        expect(res.body.errors.some((e: { field: string }) => e.field === "status")).toBe(true);
    });
});

// ─── DELETE /api/contact/:id ──────────────────────────────────────────────────

describe("DELETE /api/contact/:id", () => {
    let cookie: string;
    let contactId: string;

    beforeEach(async () => {
        cookie = await getAuthCookie();
        const res = await createContact(cookie);
        contactId = res.body.data.id as string;
    });

    it("returns 200 and success message on valid delete", async () => {
        const res = await request(app)
            .delete(`/api/contact/${contactId}`)
            .set("Cookie", cookie);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toMatch(/deleted/i);
    });

    it("soft-deletes: contact no longer appears in the list", async () => {
        await request(app)
            .delete(`/api/contact/${contactId}`)
            .set("Cookie", cookie);

        const listRes = await request(app)
            .get("/api/contact/")
            .set("Cookie", cookie);

        expect(listRes.body.data).toHaveLength(0);
    });

    it("returns 401/403 when not authenticated", async () => {
        const res = await request(app).delete(`/api/contact/${contactId}`);
        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("returns 403 when deleting another user's contact", async () => {
        const otherCookie = await getAuthCookie({ email: "other2@example.com" });

        const res = await request(app)
            .delete(`/api/contact/${contactId}`)
            .set("Cookie", otherCookie);

        expect(res.status).toBe(403);
    });

    it("returns 400 for an invalid contact id", async () => {
        const res = await request(app)
            .delete("/api/contact/invalid-id")
            .set("Cookie", cookie);

        expect(res.status).toBe(400);
        expect(res.body.errors.some((e: { field: string }) => e.field === "id")).toBe(true);
    });
});

// ─── GET /api/contact/ ────────────────────────────────────────────────────────

describe("GET /api/contact/", () => {
    let cookie: string;

    beforeEach(async () => {
        cookie = await getAuthCookie();

        // Seed three contacts with different statuses/names for filter/search tests
        await createContact(cookie, { email: "alice@example.com", name: "Alice", status: StatusEnum.LEAD });
        await createContact(cookie, { email: "bob@example.com", name: "Bob Smith", status: StatusEnum.CUSTOMER });
        await createContact(cookie, {
            email: "carol@example.com",
            name: "Carol",
            company: "Bob Industries",
            status: StatusEnum.PROSPECT,
        });
    });

    it("returns 200 with paginated contact list", async () => {
        const res = await request(app).get("/api/contact/").set("Cookie", cookie);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(3);
        expect(res.body.pagination).toMatchObject({
            total: 3,
            page: 1,
            totalPages: 1,
        });
    });

    it("returns 401/403 when not authenticated", async () => {
        const res = await request(app).get("/api/contact/");
        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("only returns contacts belonging to the authenticated user", async () => {
        const otherCookie = await getAuthCookie({ email: "other3@example.com" });
        await createContact(otherCookie, { email: "other.contact@example.com", name: "Other Contact" });

        const res = await request(app).get("/api/contact/").set("Cookie", cookie);

        expect(res.body.data).toHaveLength(3);
    });

    it("filters by status", async () => {
        const res = await request(app)
            .get(`/api/contact/?status=${StatusEnum.LEAD}`)
            .set("Cookie", cookie);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].status).toBe(StatusEnum.LEAD);
    });

    it("searches by name or company", async () => {
        const res = await request(app)
            .get("/api/contact/?search=bob")
            .set("Cookie", cookie);

        expect(res.status).toBe(200);
        // Matches "Bob Smith" (name) + "Bob Industries" (company)
        expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("paginates correctly with page and limit", async () => {
        const res = await request(app)
            .get("/api/contact/?page=1&limit=2")
            .set("Cookie", cookie);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
        expect(res.body.pagination.totalPages).toBe(2);
        expect(res.body.pagination.hasNextPage).toBe(true);
    });

    it("returns 400 for invalid page value", async () => {
        const res = await request(app).get("/api/contact/?page=0").set("Cookie", cookie);
        expect(res.status).toBe(400);
    });

    it("returns 400 for invalid limit value", async () => {
        const res = await request(app).get("/api/contact/?limit=200").set("Cookie", cookie);
        expect(res.status).toBe(400);
    });

    it("returns 400 for invalid status filter", async () => {
        const res = await request(app).get("/api/contact/?status=Invalid").set("Cookie", cookie);
        expect(res.status).toBe(400);
    });
});
