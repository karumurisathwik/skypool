// Checks the DEFAULT admin password server-side, so it never ships in browser code.
// After the admin changes the password in the app, its hash is stored in Firestore and this is no longer used.
const crypto = require("crypto");
const digest = s => crypto.createHash("sha256").update(String(s)).digest();

module.exports = (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return res.status(500).json({ ok: false, error: "ADMIN_PASSWORD is not set" });
  let body = req.body; if (typeof body === "string") { try { body = JSON.parse(body) } catch (e) { body = {} } }
  const given = (body && body.password) || "";
  res.status(200).json({ ok: crypto.timingSafeEqual(digest(given), digest(secret)) });
};
