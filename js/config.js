/* Runtime config. Values come from Vercel Environment Variables via /api/config,
   so nothing environment-specific lives in the source code. */
export const CONFIG = { firebase: {}, adminId: "admin" };

export async function loadConfig() {
  try {
    const r = await fetch("/api/config", { cache: "no-store" });
    if (r.ok) Object.assign(CONFIG, await r.json());
  } catch (e) {
    console.warn("Could not load /api/config – using browser-only storage.", e);
  }
  return CONFIG;
}
