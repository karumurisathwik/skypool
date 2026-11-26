import { CONFIG, loadConfig } from "./config.js";

export const COLORS = ["#1668e3", "#d1322b", "#0a8f6a", "#8a3ffc", "#e07b00", "#0b6e99", "#c2185b"];
export const $ = s => document.querySelector(s);
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const S = {
  view: "home", user: null, flights: [], joins: [], msg: "", tab: "flights", q: "", fa: "", fo: "", fz: "", fd: "",
  sort: "date", favOnly: false, bell: false, cf: "", ct: 2, mg: "", names: {}, lv: null, dl: null, _k: "", rm: null, pq: "", cx: "", ar: "", loaded: { flights: false, joins: false }
};
try { const t = localStorage.getItem("sp_theme"); if (t) document.documentElement.dataset.theme = t } catch (e) {}
try { S.user = JSON.parse(sessionStorage.getItem("sp_user") || "null") } catch (e) {}

/* ---------- storage: Firestore if configured, else localStorage ---------- */
let DB = null;
const subs = {};
const lsGet = n => { try { return JSON.parse(localStorage.getItem("sp_" + n) || "{}") } catch (e) { return {} } };
const lsSet = (n, o) => { try { localStorage.setItem("sp_" + n, JSON.stringify(o)) } catch (e) {} };

async function initDB() {
  await loadConfig();
  if (!CONFIG.firebase?.apiKey) return;
  try {
    for (const s of ["app", "firestore"]) {
      await new Promise((ok, no) => {
        const e = document.createElement("script");
        e.src = `https://www.gstatic.com/firebasejs/10.12.2/firebase-${s}-compat.js`;
        e.onload = ok; e.onerror = no; document.head.appendChild(e);
      });
    }
    firebase.initializeApp(CONFIG.firebase);
    DB = firebase.firestore();
  } catch (e) { console.error("Firebase failed to load", e) }
}
export const ready = initDB();

function fire(c) {
  const a = Object.entries(lsGet(c)).map(([id, v]) => ({ id, ...v }));
  (subs[c] = subs[c] || []).forEach(f => f(a));
}
window.addEventListener("storage", () => ["flights", "joins"].forEach(fire));

export const store = {
  async get(c, id) { await ready; if (DB) { const s = await DB.collection(c).doc(id).get(); return s.exists ? s.data() : null } return lsGet(c)[id] || null },
  async set(c, id, d) { await ready; if (DB) await DB.collection(c).doc(id).set(d); else { const o = lsGet(c); o[id] = d; lsSet(c, o); fire(c) } },
  async del(c, id) { await ready; if (DB) await DB.collection(c).doc(id).delete(); else { const o = lsGet(c); delete o[id]; lsSet(c, o); fire(c) } },
  async watch(c, cb) {
    await ready;
    if (DB) { DB.collection(c).onSnapshot(s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))), () => {}); return }
    (subs[c] = subs[c] || []).push(cb); fire(c);
  }
};

/* ---------- helpers ---------- */
export const sha = async t => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("skypool:" + t)))].map(b => b.toString(16).padStart(2, "0")).join("");
export const members = f => S.joins.filter(j => j.flightId === f.id);
export const discount = n => Math.min(30, Math.round(n * 2.5 * 10) / 10);
export const unitPrice = (f, n) => Math.round(f.fare * (1 - discount(n) / 100));
export const daysTo = f => Math.ceil((new Date(f.date + "T00:00") - new Date()) / 864e5);
export const fmtDate = d => new Date(d + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
export const inr = n => "₹" + Number(n).toLocaleString("en-IN");
export const initials = n => n.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "✈";
export const lsj = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || "null") ?? d } catch (e) { return d } };
export const lss = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} };
export const favs = () => S.user ? lsj("sp_fav_" + S.user.id, []) : [];
export const isFav = id => favs().includes(id);
export const gone = f => new Date(f.date + "T" + f.time) < new Date();
export const badge = f => `<div class="badge" style="background:${esc(f.color)}">${f.logo ? `<img src="${esc(f.logo)}" alt="">` : esc(initials(f.airline))}</div>`;
export const shrink = file => new Promise(res => {
  const r = new FileReader();
  r.onload = () => { const im = new Image(); im.onload = () => { const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d"), s = Math.min(im.width, im.height); x.drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 128, 128); res(c.toDataURL("image/png")) }; im.onerror = () => res(""); im.src = r.result };
  r.onerror = () => res(""); r.readAsDataURL(file);
});

/* ---------- admin password check ----------
   Once the admin changes the password, its hash lives in Firestore (settings/admin).
   Until then the default password is verified server-side (/api/admin-check),
   so it is never shipped to the browser. */
export async function adminOk(pw) {
  const s = await store.get("settings", "admin");
  if (s) return s.hash === await sha(pw);
  try {
    const r = await fetch("/api/admin-check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: pw }) });
    return r.ok && (await r.json()).ok === true;
  } catch (e) { return false }
}
