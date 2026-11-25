import { S, esc, store, members, unitPrice, discount, daysTo, fmtDate, inr, badge, gone, favs, isFav, lss } from "../state.js";
import { render, go } from "../ui.js";

export function toggleFav(id) { if (!S.user) return go("login"); const a = favs(), i = a.indexOf(id); i < 0 ? a.push(id) : a.splice(i, 1); lss("sp_fav_" + S.user.id, a); render() }

export async function join(fid) {
  if (!S.user) { go("login"); return }
  const f = S.flights.find(x => x.id === fid); if (!f || S.user.admin || members(f).length >= f.seats || gone(f)) return;
  await store.set("joins", fid + "_" + S.user.id, { flightId: fid, uid: S.user.id, confirmed: false, at: Date.now() });
}

const cities = () => [...new Set(S.flights.flatMap(f => [f.from, f.to]))].sort();
const filtersOn = () => !!(S.q.trim() || S.fa || S.fo || S.fz || S.fd || S.favOnly);
/* drop a selected filter whose flights no longer exist (e.g. admin deleted them) so the dropdown and results never disagree */
function sanitizeFilters() {
  const air = S.flights.map(f => f.airline), cs = cities();
  if (S.fa && !air.includes(S.fa)) S.fa = "";
  if (S.fo && !cs.includes(S.fo)) S.fo = "";
  if (S.fz && !cs.includes(S.fz)) S.fz = "";
}
export function clearFilters() { S.q = ""; S.fa = ""; S.fo = ""; S.fz = ""; S.fd = ""; S.favOnly = false; render() }
export function swapRoute() { const t = S.fo; S.fo = S.fz; S.fz = t; render() }

function visible() {
  sanitizeFilters();
  const q = S.q.toLowerCase().trim(), fv = S.user && !S.user.admin ? favs() : [], pr = f => unitPrice(f, Math.max(members(f).length, 1));
  return S.flights.filter(f => (!q || [f.airline, f.number, f.from, f.to].join(" ").toLowerCase().includes(q)) && (!S.fa || f.airline === S.fa) && (!S.fo || f.from === S.fo) && (!S.fz || f.to === S.fz) && (!S.fd || f.date >= S.fd) && (!S.favOnly || fv.includes(f.id)))
    .sort((a, b) => S.sort === "fare" ? pr(a) - pr(b) : a.date.localeCompare(b.date));
}
function toolsV() {
  const u = k => [...new Set(S.flights.map(f => f[k]))].sort(), opt = (a, v, all) => `<option value="">${all}</option>` + a.map(x => `<option ${x === v ? "selected" : ""}>${esc(x)}</option>`).join("");
  return `<div class="tools"><input class="grow" id="sq" placeholder="🔍 Search airline, flight no., city…" value="${esc(S.q)}" oninput="S.q=this.value;render()">
  <select id="sa" onchange="S.fa=this.value;render()">${opt(u("airline"), S.fa, "All airlines")}</select>
  <select id="so" title="From" onchange="S.fo=this.value;render()">${opt(cities(), S.fo, "From: any city")}</select>
  <button class="btn ghost swap" title="Swap From and To" aria-label="Swap From and To" onclick="swapRoute()">⇄</button>
  <select id="sz" title="To" onchange="S.fz=this.value;render()">${opt(cities(), S.fz, "To: any city")}</select>
  <input id="sd" type="date" title="Departing on or after" value="${esc(S.fd)}" onchange="S.fd=this.value;render()">
  <select id="ss" onchange="S.sort=this.value;render()"><option value="date">Earliest date</option><option value="fare" ${S.sort === "fare" ? "selected" : ""}>Lowest fare</option></select>
  ${S.user && !S.user.admin ? `<button class="btn ${S.favOnly ? "" : "ghost"}" onclick="S.favOnly=!S.favOnly;render()">★ Saved</button>` : ""}</div>`;
}
function calcV() {
  if (!S.flights.length) return "";
  const f = S.flights.find(x => x.id === S.cf) || S.flights[0], t = S.ct, n = Math.min(f.seats, members(f).length + t), p = unitPrice(f, n);
  return `<div class="card calc"><b>💰 Savings calculator</b><div class="tools" style="margin:10px 0 6px"><select id="cf" onchange="S.cf=this.value;render()">${S.flights.map(x => `<option value="${esc(x.id)}" ${x.id === f.id ? "selected" : ""}>${esc(x.airline)} ${esc(x.number)} · ${esc(x.from)} → ${esc(x.to)}</option>`).join("")}</select>
  <input id="ct" type="number" min="1" max="20" value="${t}" title="Travellers" onchange="S.ct=Math.max(1,Math.min(20,+this.value||1));render()"></div>
  <div>${t} traveller(s) → pool of ${n}: <b style="color:var(--ok)">${inr(p)}</b> each <s class="note">${inr(f.fare)}</s> · you save <b style="color:var(--ok)">${inr((f.fare - p) * t)}</b> in total (${discount(n)}% off)</div></div>`;
}

export function card(f) {
  const m = members(f), n = m.length, mine = S.user && !S.user.admin && m.find(j => j.uid === S.user.id);
  const full = n >= f.seats, d = daysTo(f);
  return `<div class="card"><div class="fh">${badge(f)}
  <div><b>${esc(f.airline)}</b><span>Flight ${esc(f.number)}</span></div>${S.user?.admin ? "" : `<button class="star ${isFav(f.id) ? "on" : ""}" title="Save pool" onclick="toggleFav('${esc(f.id)}')">${isFav(f.id) ? "★" : "☆"}</button>`}</div>
  <div class="route"><span>${esc(f.from)}</span><i></i><span>${esc(f.to)}</span></div>
  <div class="meta"><span>📅 ${fmtDate(f.date)}</span><span>🕒 ${esc(f.time)}</span><span>${d >= 0 ? d + " days left" : "Departed"}</span></div>
  <div class="cd" data-t="${esc(f.date)}T${esc(f.time)}"></div>
  <div class="price"><b>${inr(unitPrice(f, Math.max(n, 1)))}</b><s>${inr(f.fare)}</s><span class="tag">−${discount(Math.max(n, 1))}%</span></div>
  <div class="bar"><div style="width:${Math.min(100, n / f.seats * 100)}%"></div></div>
  <div class="meta"><span>${n}/${f.seats} in pool</span></div>
  <div class="chips">${m.map(j => `<span class="chip ${j.uid === S.user?.id ? "y" : ""} ${j.confirmed ? "c" : ""}">${esc(j.uid)}${j.confirmed ? " ✓" : ""}</span>`).join("") || '<span class="note">Be the first to join.</span>'}</div>
  ${mine ? '<span class="tag">You’re in this pool</span>' : S.user?.admin ? "" : `<button class="btn" ${full || d < 0 || gone(f) ? "disabled" : ""} onclick="join('${esc(f.id)}')">${full ? "Pool full" : "Join this flight pool"}</button>`}
  </div>`;
}

function greetV() {
  const u = S.user;
  if (!u) return `<h1>Fly together. Pay less.</h1>`;
  const who = u.admin ? "Admin" : esc(u.name);
  return `<h1 class="greet">Welcome${u.admin ? "" : " back"}, <span class="who">${who}</span> 👋</h1>` +
    (u.admin ? "" : `<div class="idline">Your ID: <span class="idchip">${esc(u.id)}</span></div>`) +
    `<div class="tagline">Fly together. Pay less.</div>`;
}

export function homeV() {
  const fl = visible();
  return `<div class="hero">${greetV()}<p>Airfares keep climbing. Join a SkyPool with fellow travellers on the same flight — the bigger the pool, the lower everyone’s fare.</p></div>` + calcV() + toolsV() +
    (fl.length ? `<div class="grid">${fl.map(card).join("")}</div>` : `<div class="empty card">${S.flights.length ? "No pools match your filters." + (filtersOn() ? '<br><br><button class="btn ghost" onclick="clearFilters()">Clear filters</button>' : "") : "No flight pools yet." + (S.user?.admin ? " Add one from the Admin panel." : " Check back soon!")}</div>`);
}

Object.assign(window, { toggleFav, join, clearFilters, swapRoute });
