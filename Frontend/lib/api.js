// Reads the backend API's base URL from an environment variable, so the
// same frontend code works against localhost during development and
// against the deployed backend once it's live — only .env.local changes.
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
