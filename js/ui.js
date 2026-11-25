/* Shared page shell: header nav, notifications, toast, theme, navigation, render loop. */
import { S, $, esc, store, ready, lsj, lss, favs, members, daysTo } from "./state.js";
import { CONFIG } from "./config.js";

export const PAGES = { home: "/", welcome: "/", login: "/login", signup: "/signup", mine: "/mine", admin: "/admin", account: "/account" };
let CUR = null;

/* ---------- theme ---------- */
const isDark = () => { const t = document.documentElement.dataset.theme; return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches };
export function toggleTheme() { const t = isDark() ? "light" : "dark"; document.documentElement.dataset.theme = t; try { localStorage.setItem("sp_theme", t) } catch (e) {} render() }
const themeBtn = () => `<button class="ghost" title="Toggle theme" onclick="toggleTheme()">${isDark() ? "☀️" : "🌙"}</button> `;

/* ---------- notifications ---------- */
function notifs() {
  if (!S.user || S.user.admin) return []; const out = [];
  S.joins.filter(j => j.uid === S.user.id).forEach(j => {
    const f = S.flights.find(x => x.id === j.flightId); if (!f) return; const d = daysTo(f);
    out.push({ k: "j_" + j.id, t: `You joined ${f.airline} ${f.number} (${f.from} → ${f.to}).` });
    if (!j.confirmed && d <= 21 && d >= 0) out.push({ k: "c_" + j.id, t: `⏰ Confirmation is open for ${f.number}. Confirm your seat!` });
    if (j.confirmed && d >= 0 && d <= 7) out.push({ k: "d_" + j.id, t: `✈️ ${f.number} departs in ${d} day(s).` });
  });
  favs().forEach(id => {
    const f = S.flights.find(x => x.id === id); if (!f) return; const n = members(f).length;
    if (n / f.seats >= .8) out.push({ k: `a_${id}_${n}`, t: `🔥 Saved pool ${f.number} is almost full (${n}/${f.seats}).` });
  });
  return out;
}
const readKey = () => "sp_read_" + S.user.id;
const unread = () => { const r = lsj(readKey(), []); return notifs().filter(n => !r.includes(n.k)).length };
const bellBtn = () => S.user && !S.user.admin ? `<button class="ghost bell" title="Notifications" onclick="S.bell=!S.bell;render()">🔔${unread() ? `<span class="dot">${unread()}</span>` : ""}</button> ` : "";
export function markRead() { lss(readKey(), notifs().map(n => n.k)); render() }
function renderNotif() {
  document.getElementById("np")?.remove(); if (!S.bell || !S.user || S.user.admin) return;
  const r = lsj(readKey(), []), l = notifs(), el = document.createElement("div"); el.id = "np"; el.className = "card notif";
  el.innerHTML = `<div class="row"><b>Notifications</b><span class="sp"></span><button class="btn ghost" onclick="markRead()">Mark all read</button></div>` + (l.length ? l.map(n => `<p class="${r.includes(n.k) ? "" : "new"}">${esc(n.t)}</p>`).join("") : '<p class="note">Nothing yet. Join or save a pool to get updates.</p>');
  document.body.appendChild(el);
}

/* ---------- countdown + toast ---------- */
function tick() {
  document.querySelectorAll("[data-t]").forEach(e => {
    const s = Math.floor((new Date(e.dataset.t) - new Date()) / 1e3), p = n => String(n).padStart(2, "0");
    e.textContent = s <= 0 ? "Pool closed" : `⏳ Pool closes in ${Math.floor(s / 86400)}d ${p(Math.floor(s % 86400 / 3600))}:${p(Math.floor(s % 3600 / 60))}:${p(s % 60)}`;
  });
}
setInterval(tick, 1000);
export function toast(t) { const e = document.createElement("div"); e.className = "card toast"; e.textContent = t; document.body.appendChild(e); setTimeout(() => e.remove(), 2400) }

/* ---------- navigation / session ---------- */
export function go(v, t) {
  S.msg = ""; S._k = "";
  if (v === "admin" && S.view === "admin") { if (t) S.tab = t; render(); window.scrollTo(0, 0); return }
  if (v === S.view || (v === "home" && S.view === "welcome")) { render(); window.scrollTo(0, 0); return }
  location.href = PAGES[v] + (t ? `?tab=${encodeURIComponent(t)}` : "");
}
export function login(u) {
  S.user = u; try { sessionStorage.setItem("sp_user", JSON.stringify(u)) } catch (e) {}
  location.href = u.admin ? "/admin" : "/";
}
export function logout() { S.user = null; try { sessionStorage.removeItem("sp_user") } catch (e) {} location.href = "/" }
export const adminId = () => CONFIG.adminId || "admin";

/* ---------- render loop ---------- */
export function render() {
  if (!CUR) return;
  const ae = document.activeElement, aid = ae && ae.id, ap = ae && ae.selectionStart;
  const u = S.user;
  $("#nav").innerHTML = bellBtn() + themeBtn() + (u ? `<span class="tag">${u.admin ? "Admin" : esc(u.name) + " · " + esc(u.id)}</span> ` +
    (u.admin ? `<button class="ghost" onclick="go('admin')">Admin panel</button> ` : `<button class="ghost" onclick="go('mine')">My pools</button> `) +
    `<button class="ghost" onclick="go('account')">🔑 Password</button> <button onclick="logout()">Log out</button>` :
    `<button class="ghost" onclick="go('login')">Log in</button> <button onclick="go('signup')">Sign up</button>`);
  const key = CUR.key ? CUR.key() : CUR.name, keep = CUR.keep && CUR.keep() && S._k === key;
  if (!keep) { S._k = key; $("#app").innerHTML = CUR.view() }
  renderNotif(); tick();
  if (aid) { const e = document.getElementById(aid); if (e) { e.focus(); try { e.setSelectionRange(ap, ap) } catch (x) {} } }
}

/* cfg: { name, view(), key?(), keep?(), auth?: "guest"|"user"|"nonadmin"|"admin", watch?: bool, onJoins?() } */
export function start(cfg) {
  CUR = cfg; S.view = cfg.name; const u = S.user;
  if (cfg.auth === "guest" && u) return location.replace(u.admin ? "/admin" : "/");
  if (cfg.auth === "user" && !u) return location.replace("/login");
  if (cfg.auth === "nonadmin" && (!u || u.admin)) return location.replace(u ? "/" : "/login");
  if (cfg.auth === "admin" && !u?.admin) return location.replace(u ? "/" : "/login");
  render();
  try { const t = sessionStorage.getItem("sp_toast"); if (t) { sessionStorage.removeItem("sp_toast"); setTimeout(() => toast(t), 150) } } catch (e) {}
  if (cfg.watch) {
    store.watch("flights", a => { S.flights = a; render() });
    store.watch("joins", a => { S.joins = a; render(); cfg.onJoins?.() });
  }
}

Object.assign(window, { S, $, render, go, logout, toggleTheme, markRead, toast });
export { ready };
