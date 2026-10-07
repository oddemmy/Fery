require("dotenv").config();
const { CODE_TTL_MINUTES } = require("./codes");

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

async function sendCodeEmail(to, code, purpose) {
    const isReset = purpose === "reset";
    const subject = isReset ? "Reset your password" : "Verify your email";
    const intro = isReset
        ? "Use this code to reset your password."
        : "Use this code to verify your email address.";

    // No Brevo key configured: print the code so you can still test locally
    if (!process.env.BREVO_API_KEY) {
        console.log(`[DEV] ${purpose} code for ${to}: ${code}`);
        return;
    }

    const res = await fetch(BREVO_URL, {
        method: "POST",
        headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            sender: {
                name: process.env.MAIL_FROM_NAME || "Fery",
                email: process.env.MAIL_FROM_EMAIL,
            },
            to: [{ email: to }],
            subject,
            textContent: `${intro}\n\nYour code: ${code}\n\nIt expires in ${CODE_TTL_MINUTES} minutes. If you didn't request this, ignore this email.`,
            htmlContent: `
              <div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px">
                <h2 style="margin:0 0 12px">${subject}</h2>
                <p style="color:#555">${intro}</p>
                <p style="font-size:32px;letter-spacing:8px;font-weight:bold;margin:24px 0">${code}</p>
                <p style="color:#888;font-size:13px">This code expires in ${CODE_TTL_MINUTES} minutes. If you didn't request it, you can ignore this email.</p>
              </div>`,
        }),
    });

    if (!res.ok) {
        const body = await res.text();
        console.error(`Brevo error ${res.status}: ${body}`);
        throw new Error(`Brevo request failed with status ${res.status}`);
    }
}

module.exports = { sendCodeEmail };