# Ferry

A RESTful API for shortening long URLs, built with Node.js, Express, and PostgreSQL (hosted on Supabase). Supports creating, retrieving, updating, and deleting short URLs, plus tracking how many times each one has been accessed.

A companion Next.js + Tailwind frontend (also called Ferry) provides a form for creating short links and handles redirecting visitors from a short link to its original URL, as the project spec intends.

Built as a portfolio project based on [roadmap.sh's URL Shortening Service project](https://roadmap.sh/projects/url-shortening-service).

## Tech stack

- **Node.js** + **Express** — server and routing
- **PostgreSQL** — database
- **Supabase** — hosted Postgres, connected via the `pg` library
- **dotenv** — environment variable management

## Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/shorten` | Create a new short URL |
| `GET` | `/shorten/:code` | Retrieve the original URL and increment its access count |
| `PUT` | `/shorten/:code` | Update the URL a short code points to |
| `DELETE` | `/shorten/:code` | Delete a short URL |
| `GET` | `/shorten/:code/stats` | View a short URL's details and access count, without incrementing it |

### `POST /shorten`

Request body:
```json
{ "url": "https://www.example.com/some/long/url" }
```

Response (`201 Created`):
```json
{
  "id": "uuid",
  "url": "https://www.example.com/some/long/url",
  "short_code": "abc123",
  "created_at": "2026-09-01T12:00:00Z",
  "updated_at": "2026-09-01T12:00:00Z",
  "access_count": 0
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

## Database schema

```sql
CREATE TABLE url_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  short_code text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  access_count integer NOT NULL DEFAULT 0
);
```

Row Level Security is enabled on this table with no policies, so it's only reachable through a direct database connection (as this server uses), not through Supabase's public Data API.

## Setup

1. Clone the repository:
   ```
   git clone <your-repo-url>
   cd URL_SHORTENING_SERVICE
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a Supabase project and run the `CREATE TABLE` statement above in its SQL Editor.

4. Create a `.env` file in the project root:
   ```
   PORT=3000
   DATABASE_URL=your_supabase_connection_string
   ```
   Use the **session pooler** connection string if your network doesn't support IPv6 (common on many home/mobile connections).

5. Start the server:
   ```
   node src/index.js
   ```

The API will be running at `http://localhost:3000`.

## Environment variables

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (defaults to `3000` if not set) |
| `DATABASE_URL` | PostgreSQL connection string (Supabase session pooler recommended) |
