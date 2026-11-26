import { S, esc, members, unitPrice, daysTo, fmtDate, inr, badge, gone } from "../state.js";
import "../actions.js";

/* the confirmation / cancellation controls for one of my pools (also used on the flight details page) */
export function myStatusV(j, f) {
  const d = daysTo(f), open = d <= 21 && d >= 0;
  if (j.confirmed && j.cancelReq) return `<p style="color:var(--warn,#e07b00);font-weight:700">⏳ Cancellation requested</p>
    <p class="note">Waiting for the admin to approve. Your ticket stays active until then.</p>
    <div class="row"><button class="btn ghost" onclick="withdrawCancel('${esc(j.id)}')">Withdraw request</button></div>`;
  if (j.confirmed) return `<p style="color:var(--ok);font-weight:700">✓ Booking confirmed</p>
    <div class="row"><button class="btn bad" ${gone(f) ? "disabled" : ""} onclick="applyCancel('${esc(j.id)}')">${S.cx === j.id ? "Tap again to apply" : "Apply for cancellation"}</button></div>
    <p class="note">A confirmed ticket is cancelled only after the admin approves your request.</p>`;
  return `<p class="note">${open ? "Confirmation is open — confirm your seat now." : d > 21 ? "Confirmation opens " + (d - 21) + " day(s) from now (3 weeks before departure)." : "Confirmation window closed."}</p>
    <div class="row"><button class="btn ok" ${open ? "" : "disabled"} onclick="confirmJ('${esc(j.id)}')">Confirm</button>
    <button class="btn bad" onclick="leave('${esc(j.id)}')">${S.lv === j.id ? "Tap again to leave" : "Leave pool"}</button></div>`;
}

export function mineV() {
  const my = S.joins.filter(j => j.uid === S.user.id);
  return `<h2>My pools</h2>` + (S.msg ? `<div class="err">${esc(S.msg)}</div>` : "") + (my.length ? `<div class="grid">${my.map(j => {
    const f = S.flights.find(x => x.id === j.flightId); if (!f) return "";
    const n = members(f).length;
    return `<div class="card clk" tabindex="0" role="link" aria-label="${esc(f.airline)} ${esc(f.number)} – view details" onclick="openFlight('${esc(f.id)}',event)" onkeydown="openFlight('${esc(f.id)}',event)"><div class="fh">${badge(f)}<div><b>${esc(f.airline)} ${esc(f.number)}</b><span>${esc(f.from)} → ${esc(f.to)} · ${fmtDate(f.date)}</span></div></div>
    <div class="price"><b>${inr(unitPrice(f, n))}</b><s>${inr(f.fare)}</s><span class="tag">${n} in pool</span></div>
    ${myStatusV(j, f)}<div class="more">View details ›</div></div>`
  }).join("")}</div>` :
    `<div class="empty card">You haven’t joined any pool yet.<br><br><button class="btn" onclick="go('home')">Browse flights</button></div>`);
}
