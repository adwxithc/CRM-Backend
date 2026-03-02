# CRM Backend

A RESTful CRM backend built with **Express 5**, **TypeScript**, and **MongoDB** (Mongoose). Features JWT cookie-based auth, contact management with pagination, activity logging, and rate limiting.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Language | TypeScript (`nodenext`, strict mode) |
| Database | MongoDB + Mongoose 9 |
| Pagination | mongoose-paginate-v2 |
| Auth | JWT (httpOnly cookies) |
| Validation | express-validator |
| Rate Limiting | express-rate-limit |
| Testing | Jest + ts-jest + Supertest + mongodb-memory-server |

---

## Project Structure

```
src/
├── app.ts                  # Express app setup
├── index.ts                # Server entry point
├── config/
│   └── db.ts               # MongoDB connection
├── constants/
│   └── contact.ts          # ActionEnum, StatusEnum, STATUS_VALUES
├── controller/
│   ├── authController.ts
│   ├── contactController.ts
│   └── activityLogController.ts
├── errors/                 # Custom error classes (CustomError base)
├── middlewares/
│   ├── authMiddleware.ts   # JWT cookie verification
│   ├── error-handler.ts    # Global error handler
│   ├── rateLimiter.ts      # Login rate limiter
│   ├── multer.ts
│   └── validateRequest.ts
├── model/
│   ├── userModel.ts
│   ├── contactModel.ts
│   └── activityLog.ts
├── repository/             # Data access layer
├── routes/
│   ├── authRouter.ts
│   ├── contactRouter.ts
│   └── activityLogRouter.ts
├── services/
│   ├── hash.ts             # bcrypt helpers
│   └── jwt.ts              # JWT sign/verify
├── types/
├── utils/
│   ├── tockenOptions.ts    # Cookie options
│   └── toObjectId.ts
├── validations/            # express-validator chains
└── __tests__/
    ├── setup.ts            # Shared MongoMemoryServer helpers
    ├── helpers/
    │   └── auth.ts         # registerUser / loginUser / getAuthCookie
    ├── auth/
    │   ├── auth.test.ts
    │   └── rateLimiter.test.ts
    └── contact/
        └── contact.test.ts
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB (local or Atlas)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/CRM
JWT_KEY=your_access_token_secret
JWT_REFRESH_KEY=your_refresh_token_secret
ACCESS_TOKEN_EXPIRE=1h
REFRESH_TOKEN_EXPIRE=30d
FRONT_END_URL=http://localhost:5173

# Set to "true" to bypass login rate limiting (useful in dev/testing)
# DISABLE_RATE_LIMIT=true
```

### Running

```bash
# Development (watch mode)
npm run dev

# Production build
npm run build
npm start
```

---

## API Reference

All endpoints return JSON. Error responses follow the shape:
```json
{ "errors": [{ "message": "...", "field": "..." }] }
```

Success responses follow the shape:
```json
{ "success": true, "data": {}, "message": "..." }
```

---

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | ✗ | Create a new account |
| POST | `/login` | ✗ | Login and receive `accessToken` + `refreshToken` cookies. Rate limited: **3 requests / 10 min per IP** |
| GET | `/me` | ✓ | Get currently authenticated user |
| POST | `/logout` | ✓ | Clear auth cookies |
| GET | `/refresh` | ✗ | Refresh access token using `refreshToken` cookie |

#### POST `/api/auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Secret@123"
}
```
Password rules: 6–20 characters, must contain a letter, a number, and a special character.

#### POST `/api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "Secret@123"
}
```
Sets `accessToken` and `refreshToken` as `httpOnly` cookies on success.

---

### Contacts — `/api/contact` 🔒

All contact routes require authentication (`accessToken` cookie).

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create a contact |
| GET | `/` | List contacts (paginated, search, filter) |
| PUT | `/:id` | Edit a contact (owner only) |
| DELETE | `/:id` | Soft-delete a contact (owner only) |

#### POST / PUT body fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ✓ | |
| `email` | string | ✓ | valid email format |
| `phone` | string | ✓ | 7–20 digits, optional `+`, spaces, dashes |
| `company` | string | ✓ | |
| `status` | string | ✓ | `Lead` \| `Prospect` \| `Customer` |
| `notes` | string | ✗ | |

#### GET `/api/contact` query params

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer ≥ 1 | `1` | Page number |
| `limit` | integer 1–100 | `10` | Items per page |
| `search` | string | — | Regex search on name, email, company |
| `status` | string | — | Filter by status |

#### Paginated response shape
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### Activity Log — `/api/activity` 🔒

Returns the authenticated user's contact activity history (ADD / EDIT / DELETE), newest first. Contact name and email are populated.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List activity logs (paginated) |

#### GET `/api/activity` query params

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer ≥ 1 | `1` | Page number |
| `limit` | integer 1–100 | `10` | Items per page |

---

## Authentication

Authentication uses **httpOnly JWT cookies**:

- `accessToken` — short-lived (default `1h`), sent on every protected request automatically by the browser
- `refreshToken` — long-lived (default `30d`), used by `GET /api/auth/refresh` to issue a new access token

No `Authorization: Bearer` header needed — cookies are handled automatically.

---

## Rate Limiting

The `/api/auth/login` route is rate limited to **3 requests per 10 minutes per IP**.

When the limit is exceeded the API returns:
```json
HTTP 429
{ "errors": [{ "message": "Too many login attempts, please try again after 10 minutes" }] }
```

Set `DISABLE_RATE_LIMIT=true` in `.env` to disable (development / testing).

---

## Running Tests

```bash
# Run all tests once
npm test

# Watch mode
npm run test:watch
```

Tests use an in-memory MongoDB instance (`mongodb-memory-server`) — no external DB required.

### Test coverage

| Suite | Tests |
|---|---|
| `auth/auth.test.ts` | register, login, /me, logout |
| `auth/rateLimiter.test.ts` | 429 after 3 failed login attempts |
| `contact/contact.test.ts` | create, edit, delete, list with pagination/search/filter |

---

## Linting & Formatting

```bash
npm run lint        # ESLint
npm run lint:fix    # ESLint with auto-fix
npm run format      # Prettier
```
