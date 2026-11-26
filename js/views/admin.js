import { S, $, esc, store, sha, COLORS, members, unitPrice, inr, shrink, fmtDate, badge } from "../state.js";
import { render, go, toast } from "../ui.js";
import { card } from "./home.js";
import "../actions.js";

const saveFlight = (f, p) => { const { id, ...r } = f; return store.set("flights", id, { ...r, ...p }) };

export async function fetchAllNames() {
  if (!S.user?.admin) return;
  const need = [...new Set(S.joins.map(j => j.uid))].filter(u => !(u in S.names)); need.forEach(u => S.names[u] = "…");
  for (const u of need) { try { const a = await store.get("accounts", u); S.names[u] = a ? a.name : "(deleted)" } catch (e) { S.names[u] = "(unavailable)" } }
  if (need.length) render();
}
function manage(id) { S.mg = S.mg === id ? "" : id; render() }
async function resetPw(uid, val) {
  if (!S.user?.admin) return; if ((val || "").length < 4) { toast("Use at least 4 characters"); return }
  try { const x = await store.get("accounts", uid); if (!x) { toast("Account not found"); return } await store.set("accounts", uid, { ...x, hash: await sha(val) }); toast("Password reset for " + uid) } catch (e) { toast("Couldn’t reset password") }
}
async function setLimit(id) {
  const f = S.flights.find(x => x.id === id), n = +$("#lim").value, m = members(f).length;
  if (!(n >= 2) || n < m) { $("#lerr").textContent = `Limit must be at least ${Math.max(2, m)} (current members).`; return }
  await saveFlight(f, { seats: n, fare: +$("#ef").value || f.fare, date: $("#ed").value || f.date, time: $("#et").value || f.time }); toast("Saved ✓");
}
async function setLogo(id, file) {
  if (!file) return; const d = await shrink(file); if (!d) { $("#lerr").textContent = "Couldn’t read that image."; return }
  await saveFlight(S.flights.find(x => x.id === id), { logo: d });
}
async function addFlight(e) {
  e.preventDefault(); const v = i => $("#" + i).value.trim();
  const id = "f" + Date.now().toString(36), lf = $("#lg").files[0], logo = lf ? await shrink(lf) : "";
  await store.set("flights", id, { airline: v("al"), number: v("fn").toUpperCase(), from: v("fr").toUpperCase(), to: v("to").toUpperCase(), date: v("dt"), time: v("tm"), fare: +v("fa"), seats: +v("se"), color: $("#co").value, logo });
  go("admin", "flights");
}
async function delFlight(id) {
  if (S.dl !== id) { S.dl = id; render(); return } S.dl = null;
  await store.del("flights", id); for (const j of S.joins.filter(x => x.flightId === id)) await store.del("joins", j.id);
}
async function demo() {
  const iso = n => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
  const L = [["IndiGo", "6E-204", "DEL", "BOM", 15, "07:15", 5400, 20, 0], ["Air India", "AI-101", "DEL", "LHR", 45, "02:30", 48000, 15, 1], ["Vistara", "UK-845", "BLR", "DEL", 30, "18:40", 6200, 25, 2], ["SpiceJet", "SG-8169", "BOM", "GOI", 10, "09:05", 3100, 12, 3]];
  for (const [a, n, f, t, d, tm, fa, se, c] of L) await store.set("flights", "d" + n.replace(/\W/g, ""), { airline: a, number: n, from: f, to: t, date: iso(d), time: tm, fare: fa, seats: se, color: COLORS[c] });
}

function statsV() {
  const ppl = new Set(S.joins.map(j => j.uid)).size, conf = S.joins.filter(j => j.confirmed).length;
  const save = S.flights.reduce((s, f) => { const n = members(f).length; return s + (f.fare - unitPrice(f, Math.max(n, 1))) * n }, 0);
  const box = (a, b) => `<div class="card" style="padding:12px;text-align:center"><b style="font-size:22px">${a}</b><div class="note" style="margin:0">${b}</div></div>`;
  return `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr));margin-bottom:16px">${box(S.flights.length, "Pools")}${box(ppl, "Travellers")}${box(conf + "/" + S.joins.length, "Confirmed")}${box(inr(save), "Total saved")}</div>`;
}
const statusTxt = j => j.cancelReq ? "⏳ Cancellation requested" : j.confirmed ? "✓ Confirmed" : "Pending";
const fmtDT = ts => ts ? new Date(ts).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "";

/* cancellation requests from confirmed passengers; approving removes the passenger so the row disappears */
function requestsV() {
  const rs = S.joins.filter(j => j.cancelReq).map(j => ({ j, f: S.flights.find(x => x.id === j.flightId) })).filter(r => r.f).sort((a, b) => (a.j.cancelAt || 0) - (b.j.cancelAt || 0));
  if (!rs.length) return `<div class="empty card">No cancellation requests right now.</div>`;
  return `<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">${rs.map(({ j, f }) => `<div class="card"><div class="row"><b>${esc(S.names[j.uid] || "…")}</b><span class="sp"></span><span class="chip">${esc(j.uid)}</span></div>
    <p class="note" style="margin:6px 0">${esc(f.airline)} ${esc(f.number)} · ${esc(f.from)} → ${esc(f.to)} · ${fmtDate(f.date)}</p>
    <p class="note" style="margin:0 0 10px">Requested ${esc(fmtDT(j.cancelAt))}</p>
    <div class="row"><button class="btn ok" onclick="approveCancel('${esc(j.id)}')">${S.ar === j.id ? "Tap again to approve" : "Approve cancellation"}</button><button class="btn ghost" onclick="declineCancel('${esc(j.id)}')">Decline</button></div></div>`).join("")}</div>`;
}

function peopleV() {
  const q = S.pq.toLowerCase(), rows = S.joins.map(j => ({ j, f: S.flights.find(x => x.id === j.flightId) })).filter(r => r.f && (!q || (r.j.uid + " " + (S.names[r.j.uid] || "")).toLowerCase().includes(q)));
  return `<input id="pq" placeholder="🔍 Search name or ID" value="${esc(S.pq)}" oninput="S.pq=this.value;render()" style="margin-bottom:12px"><div class="card" style="overflow-x:auto;padding:8px 14px"><table style="width:100%;border-collapse:collapse;font-size:13.5px"><tr style="color:var(--mut)"><th>Name</th><th>ID</th><th>Flight</th><th>Status</th><th>Reset password</th></tr>${rows.map(({ j, f }) => `<tr style="border-top:1px solid var(--line)"><td>${esc(S.names[j.uid] || "…")}</td><td><span class="chip">${esc(j.uid)}</span></td><td>${esc(f.airline)} ${esc(f.number)} · ${esc(f.from)}→${esc(f.to)}</td><td style="color:${j.cancelReq ? "var(--warn,#e07b00)" : j.confirmed ? "var(--ok)" : "var(--mut)"}">${statusTxt(j)}</td><td><div class="row" style="flex-wrap:nowrap"><input placeholder="New password" style="min-width:110px;padding:5px 8px"><button class="btn ghost" style="padding:4px 8px" onclick="resetPw('${esc(j.uid)}',this.previousElementSibling.value)">Set</button></div></td></tr>`).join("") || '<tr><td colspan="5" class="note">No one has joined a pool yet.</td></tr>'}</table></div>`;
}
function adminCard(f) {
  const m = members(f), open = S.mg === f.id;
  const pend = members(f).filter(j => j.cancelReq).length;
  return `<div>${card(f)}${pend ? `<p class="tag" style="margin:8px 0 0;display:inline-block">⏳ ${pend} cancellation request${pend > 1 ? "s" : ""}</p>` : ""}<div class="row" style="margin-top:6px"><button class="btn" style="flex:1" onclick="manage('${esc(f.id)}')">${open ? "Close" : "Manage"}</button><button class="btn bad" style="flex:1" onclick="delFlight('${esc(f.id)}')">${S.dl === f.id ? "Tap again to delete" : "Delete"}</button></div>` +
    (open ? `<div class="card" style="margin-top:8px"><b>Edit pool</b>
  <div class="two"><div><label>Base fare (₹)</label><input id="ef" type="number" min="1" value="${f.fare}"></div><div><label>Date</label><input id="ed" type="date" value="${esc(f.date)}"></div></div><label>Time</label><input id="et" type="time" value="${esc(f.time)}">
  <label>Pool limit</label><div class="row" style="flex-wrap:nowrap"><input id="lim" type="number" min="${Math.max(2, m.length)}" value="${f.seats}"><button class="btn" onclick="setLimit('${esc(f.id)}')">Save changes</button></div>
  <label>Flight logo</label><input type="file" accept="image/*" onchange="setLogo('${esc(f.id)}',this.files[0])"><div class="err" id="lerr"></div></div>` : "") + `</div>`;
}
export function adminV() {
  const t = S.tab, reqN = S.joins.filter(j => j.cancelReq && S.flights.some(f => f.id === j.flightId)).length;
  return `<h2>Admin panel</h2><div class="tabs"><button class="btn ${t === "flights" ? "" : "ghost"}" onclick="go('admin','flights')">Published pools</button><button class="btn ${t === "add" ? "" : "ghost"}" onclick="go('admin','add')">Add flight</button><button class="btn ${t === "people" ? "" : "ghost"}" onclick="go('admin','people')">People</button><button class="btn ${t === "requests" ? "" : "ghost"}" onclick="go('admin','requests')">Cancel requests${reqN ? ` (${reqN})` : ""}</button></div>` +
    statsV() + (t === "requests" ? requestsV() : t === "people" ? peopleV() : t === "add" ? `<form class="card" style="margin:0;max-width:640px" onsubmit="addFlight(event)">
  <div class="two"><div><label>Airline name</label><input id="al" required placeholder="IndiGo" oninput="logoPreview()"></div><div><label>Flight number</label><input id="fn" required placeholder="6E-204" oninput="logoPreview()"></div></div>
  <div class="row" style="margin:8px 0 0"><span id="lp"></span><span class="note" style="margin:0">The airline logo is found automatically from the name or the flight number (e.g. 6E-204). Upload an image below to override it.</span></div>
  <div class="two"><div><label>From</label><input id="fr" required placeholder="DEL"></div><div><label>To</label><input id="to" required placeholder="BOM"></div></div>
  <div class="two"><div><label>Departure date</label><input id="dt" type="date" required></div><div><label>Time</label><input id="tm" type="time" required></div></div>
  <div class="two"><div><label>Base fare per person (₹)</label><input id="fa" type="number" min="1" required></div><div><label>Pool seats</label><input id="se" type="number" min="2" value="20" required></div></div>
  <label>Logo image (optional)</label><input id="lg" type="file" accept="image/*"><label>Fallback colour</label><select id="co">${COLORS.map((c, i) => `<option value="${c}">Colour ${i + 1}</option>`).join("")}</select>
  <p class="note">Without an image, the logo is made from the airline initials. Discount grows 2.5% per member, up to 30%.</p>
  <button class="btn" style="width:100%;margin-top:10px">Publish pool</button></form>` :
      S.flights.length ? `<div class="grid">${S.flights.map(adminCard).join("")}</div>` :
        `<div class="empty card">Nothing published yet.<br><br><button class="btn" onclick="go('admin','add')">Add a flight</button> <button class="btn ghost" onclick="demo()">Load demo flights</button></div>`);
}
function logoPreview() { const el = $("#lp"); if (!el) return; const al = $("#al").value.trim(), fn = $("#fn").value.trim(); el.innerHTML = al || fn ? badge({ airline: al, number: fn, color: COLORS[0] }) : "" }
Object.assign(window, { logoPreview, manage, resetPw, setLimit, setLogo, addFlight, delFlight, demo });
