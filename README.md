# Fery

A RESTful URL shortening service, built as a portfolio project based on [roadmap.sh's URL Shortening Service project](https://roadmap.sh/projects/url-shortening-service). Supports creating, retrieving, updating, and deleting short URLs, tracking visit counts, and optional user accounts for keeping track of the links you've created.

A companion Next.js + Tailwind frontend (also called Fery) provides the shortening form, a stats lookup, sign up/log in, a "My links" dashboard, and handles redirecting visitors from a short link to its original URL, as the project spec intends.

## Tech stack

**Backend**
- **Node.js** + **Express** — server and routing
- **PostgreSQL** — database
- **Supabase** — hosted Postgres, connected via the `pg` library
- **bcrypt** — password hashing
- **jsonwebtoken** — issuing and verifying JWTs for authentication
- **cors**, **dotenv** — middleware and environment variable management

**Frontend**
- **Next.js** (App Router) + **Tailwind CSS**
- Plain `fetch` against the backend API, with the JWT stored in `localStorage`

## Live demo

- Frontend: `https://tryfery.vercel.app`
- API: `https://ferry-5atd.onrender.com` 

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/shorten` | Optional | Create a new short URL. If a valid token is sent, the link is attached to that user. |
| `GET` | `/shorten/:code` | — | Retrieve the original URL and increment its access count |
| `PUT` | `/shorten/:code` | — | Update the URL a short code points to |
| `DELETE` | `/shorten/:code` | — | Delete a short URL |
| `GET` | `/shorten/:code/stats` | — | View a short URL's details and access count, without incrementing it |
| `POST` | `/auth/signup` | — | Create an account (`email`, `password`) |
| `POST` | `/auth/login` | — | Log in and receive a JWT |
| `GET` | `/me/links` | Required | List every link created by the logged-in user |

### `POST /shorten`

Request body:
```json
{ "url": "https://www.example.com/some/long/url" }
```

Optionally include `Authorization: Bearer <token>` to attach the link to your account.

Response (`201 Created`):
```json
{
  "id": "uuid",
  "url": "https://www.example.com/some/long/url",
  "short_code": "abc123",
  "created_at": "2026-09-01T12:00:00Z",
  "updated_at": "2026-09-01T12:00:00Z",
  "access_count": 0,
  "user_id": null
}
```

Returns `400 Bad Request` if `url` is missing or not a valid `http`/`https` URL.

### `GET /shorten/:code`

Returns the matching row and increments `access_count` by 1. Returns `404 Not Found` if the code doesn't exist.

### `PUT /shorten/:code`

Request body:
```json
{ "url": "https://www.example.com/some/updated/url" }
```

Updates the URL and `updated_at`. Returns `400` for an invalid URL, `404` if the code doesn't exist, `200` on success.

### `DELETE /shorten/:code`

Deletes the row. Returns `204 No Content` on success, `404` if the code doesn't exist.

### `GET /shorten/:code/stats`

Returns the full row, including `access_count`, without incrementing it. Returns `404` if the code doesn't exist.

### `POST /auth/signup`

Request body:
```json
{ "email": "you@example.com", "password": "yourpassword" }
```

Response (`201 Created`):
```json
{ "id": "uuid", "email": "you@example.com", "created_at": "2026-09-01T12:00:00Z" }
```

Passwords are hashed with bcrypt before storage; the hash is never returned. Returns `400` for a missing email/password, or if the email is already in use.

### `POST /auth/login`

Request body:
```json
{ "email": "you@example.com", "password": "yourpassword" }
```

Response (`200 OK`):
```json
{ "id": "uuid", "email": "you@example.com", "token": "eyJhbGciOi..." }
```

Returns `404` with `"Invalid credentials"` for a wrong email or password (the message is deliberately identical for both, to avoid revealing which one was wrong). The token expires after 1 hour.

### `GET /me/links`

Requires `Authorization: Bearer <token>`. Returns every link created by the logged-in user, as a plain array (empty if they haven't created any yet). Returns `401` if the token is missing, invalid, or expired.

## Database schema

```sql
CREATE TABLE url_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  short_code text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  access_count integer NOT NULL DEFAULT 0,
  user_id uuid REFERENCES users(id)
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

`url_table.user_id` is nullable — a link created without being logged in simply has no owner, and still works normally (redirects, counts visits, can be looked up by anyone who has the code). It's only populated when a valid token was sent on `POST /shorten`.

Row Level Security is enabled on both tables with no policies, so they're only reachable through a direct database connection (as this server uses), not through Supabase's public Data API.

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/oddemmy/Fery.git
   cd Fery
   ```

2. **Backend:**
   ```
   cd Backend
   npm install
   ```
   Run the `CREATE TABLE` statements above in your Supabase SQL Editor, then create a `.env` file:
   ```
   PORT=3000
   DATABASE_URL=your_supabase_connection_string
   JWT_SECRET=a_long_random_string_you_make_up
   ```
   Use the **session pooler** connection string if your network doesn't support IPv6 (common on many home/mobile connections). Start the server:
   ```
   node src/index.js
   ```
   The API runs at `http://localhost:3000`.

3. **Frontend:**
   ```
   cd ../Frontend
   npm install
   cp .env.local.example .env.local
   ```
   Edit `.env.local` to point at your backend:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```
   Start the dev server:
   ```
   npm run dev
   ```
   The frontend runs at `http://localhost:3001` (deliberately a different port from the backend's default 3000).

## Frontend pages

| Path | Description |
|---|---|
| `/` | Shorten a URL, look up stats for an existing code |
| `/signup` | Create an account |
| `/login` | Log in |
| `/my-links` | List of the logged-in user's shortened links (redirects to a login prompt if not logged in) |
| `/[code]` | Not a page you visit directly — this is what makes a short link work. Looks up the code against the API and redirects to the original URL |

The layout is a responsive sidebar: a left-hand nav on wider screens, collapsing to a top bar with a slide-out menu on mobile.

## Environment variables

**Backend**

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (defaults to `3000` if not set) |
| `DATABASE_URL` | PostgreSQL connection string (Supabase session pooler recommended) |
| `JWT_SECRET` | Secret used to sign and verify login tokens — keep this private |

**Frontend**

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API |

## Possible future improvements

- Rate limiting on `POST /shorten` to discourage abuse
- TypeScript conversion
- Visit logs with timestamps, rather than a single running count