const crypto = require("crypto");
const pool = require("./db");

const CODE_TTL_MINUTES = 15;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

// Codes are stored hashed, never in plain text
const hashCode = (code) =>
    crypto.createHmac("sha256", process.env.JWT_SECRET).update(String(code)).digest("hex");

// Creates (or replaces) the code for this user + purpose and returns the plain code to email
async function issueCode(userId, purpose) {
    const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
    await pool.query(
        `INSERT INTO email_codes (user_id, purpose, code_hash, expires_at, attempts, created_at)
         VALUES ($1, $2, $3, now() + ($4::int * interval '1 minute'), 0, now())
         ON CONFLICT (user_id, purpose) DO UPDATE
         SET code_hash = EXCLUDED.code_hash,
             expires_at = EXCLUDED.expires_at,
             attempts = 0,
             created_at = now()`,
        [userId, purpose, hashCode(code), CODE_TTL_MINUTES]
    );
    return code;
}

// True if a code was sent too recently to send another
async function onCooldown(userId, purpose) {
    const result = await pool.query(
        `SELECT 1 FROM email_codes
         WHERE user_id = $1 AND purpose = $2
         AND created_at > now() - ($3::int * interval '1 second')`,
        [userId, purpose, RESEND_COOLDOWN_SECONDS]
    );
    return result.rows.length > 0;
}

// Returns "ok" | "invalid" | "expired" | "locked". A correct code is consumed (single use).
async function checkCode(userId, purpose, code) {
    // Count the attempt first so parallel guesses can't dodge the limit
    const result = await pool.query(
        `UPDATE email_codes SET attempts = attempts + 1
         WHERE user_id = $1 AND purpose = $2
         RETURNING code_hash, attempts, (expires_at < now()) AS expired`,
        [userId, purpose]
    );
    if (result.rows.length === 0) return "invalid";
    const row = result.rows[0];
    if (row.expired) return "expired";
    if (row.attempts > MAX_ATTEMPTS) return "locked";

    const given = Buffer.from(hashCode(code));
    const stored = Buffer.from(row.code_hash);
    if (given.length !== stored.length || !crypto.timingSafeEqual(given, stored)) {
        return "invalid";
    }
    await pool.query("DELETE FROM email_codes WHERE user_id = $1 AND purpose = $2", [userId, purpose]);
    return "ok";
}

module.exports = { issueCode, onCooldown, checkCode, CODE_TTL_MINUTES };