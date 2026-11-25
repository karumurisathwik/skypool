import { S, esc, store, members, unitPrice, daysTo, fmtDate, inr, badge } from "../state.js";
import { render } from "../ui.js";

async function confirmJ(id) {
  const j = S.joins.find(x => x.id === id), f = j && S.flights.find(x => x.id === j.flightId); if (!f) return; const d = daysTo(f);
  if (d > 21 || d < 0) { S.msg = "Confirmation opens only within 3 weeks of departure."; render(); return }
  await store.set("joins", id, { flightId: j.flightId, uid: j.uid, confirmed: true, at: j.at });
}
/* two-tap confirm (browser confirm() can be blocked) */
async function leave(id) { if (S.lv !== id) { S.lv = id; render(); return } S.lv = null; await store.del("joins", id); render() }

export function mineV() {
  const my = S.joins.filter(j => j.uid === S.user.id);
  return `<h2>My pools</h2>` + (S.msg ? `<div class="err">${esc(S.msg)}</div>` : "") + (my.length ? `<div class="grid">${my.map(j => {
    const f = S.flights.find(x => x.id === j.flightId); if (!f) return "";
    const d = daysTo(f), open = d <= 21 && d >= 0, n = members(f).length;
    return `<div class="card"><div class="fh">${badge(f)}<div><b>${esc(f.airline)} ${esc(f.number)}</b><span>${esc(f.from)} → ${esc(f.to)} · ${fmtDate(f.date)}</span></div></div>
    <div class="price"><b>${inr(unitPrice(f, n))}</b><s>${inr(f.fare)}</s><span class="tag">${n} in pool</span></div>
    ${j.confirmed ? `<p style="color:var(--ok);font-weight:700">✓ Booking confirmed</p>` : `
    <p class="note">${open ? "Confirmation is open — confirm your seat now." : d > 21 ? "Confirmation opens " + (d - 21) + " day(s) from now (3 weeks before departure)." : "Confirmation window closed."}</p>
    <div class="row"><button class="btn ok" ${open ? "" : "disabled"} onclick="confirmJ('${esc(j.id)}')">Confirm</button>
    <button class="btn bad" onclick="leave('${esc(j.id)}')">${S.lv === j.id ? "Tap again to leave" : "Leave pool"}</button></div>`}</div>`
  }).join("")}</div>` :
    `<div class="empty card">You haven’t joined any pool yet.<br><br><button class="btn" onclick="go('home')">Browse flights</button></div>`);
}
Object.assign(window, { confirmJ, leave });
