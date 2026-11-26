import { S, esc, members, unitPrice, discount, daysTo, fmtDate, inr, badge, gone } from "../state.js";
import "../actions.js";
import { myStatusV } from "./mine.js";

export function goBack() {
  let same = false; try { same = document.referrer && new URL(document.referrer).origin === location.origin } catch (e) {}
  if (same && history.length > 1) history.back(); else location.href = S.user?.admin ? "/admin" : "/";
}
window.goBack = goBack;

const statusTxt = j => j.cancelReq ? "⏳ Cancellation requested" : j.confirmed ? "✓ Confirmed" : "Pending";
const statusClr = j => j.cancelReq ? "var(--warn,#e07b00)" : j.confirmed ? "var(--ok)" : "var(--mut)";

function info(label, val) { return `<div class="fi"><span>${label}</span><b>${val}</b></div>` }

function travellersV(f, m) {
  const u = S.user;
  if (!u) return `<div class="card"><b>👥 Travellers</b><p class="note">${m.length} in this pool. <a href="/login">Log in</a> to see who has joined.</p></div>`;
  if (u.admin) {
    return `<div class="card"><b>👥 Passengers (${m.length}/${f.seats})</b>` + (m.length ? m.map(j => `<div class="row mrow">
      <span><b>${esc(S.names[j.uid] || "…")}</b><br><span class="chip">${esc(j.uid)}</span></span><span class="sp"></span>
      <span class="tag" style="color:${statusClr(j)}">${statusTxt(j)}</span>
      <button class="btn bad" style="padding:5px 10px" onclick="removeM('${esc(j.id)}')">${S.rm === j.id ? "Sure?" : "Remove"}</button></div>`).join("") : '<p class="note">No one has joined yet.</p>') +
      `<p class="note" style="margin-bottom:0">Only passengers can confirm their own seat. Cancellation requests are handled in <a href="/admin?tab=requests">Admin → Cancel requests</a>.</p></div>`;
  }
  return `<div class="card"><b>👥 Travellers in this pool (${m.length})</b><div class="chips" style="margin-top:10px">` +
    (m.map(j => `<span class="chip ${j.uid === u.id ? "y" : ""} ${j.confirmed ? "c" : ""}">${esc(j.uid)}${j.uid === u.id ? " (you)" : ""}${j.confirmed ? " ✓" : ""}</span>`).join("") || '<span class="note">Be the first to join.</span>') +
    `</div><p class="note" style="margin-bottom:0">✓ = confirmed. Only IDs are shown, never names.</p></div>`;
}

function actionsV(f, m) {
  const u = S.user, n = m.length, d = daysTo(f);
  if (u?.admin) return "";
  const mine = u && m.find(j => j.uid === u.id);
  if (mine) return `<div class="card"><b>Your booking</b>${myStatusV(mine, f)}</div>`;
  const full = n >= f.seats;
  return `<div class="card"><button class="btn" style="width:100%" ${full || d < 0 || gone(f) ? "disabled" : ""} onclick="join('${esc(f.id)}')">${full ? "Pool full" : gone(f) ? "Departed" : u ? "Join this flight pool" : "Log in to join this pool"}</button></div>`;
}

export function flightV() {
  const back = `<button class="btn ghost" onclick="goBack()">← Back</button>`;
  if (!S.loaded.flights || !S.loaded.joins) return `<div class="empty card">Loading flight…</div>`;
  const id = new URLSearchParams(location.search).get("id"), f = S.flights.find(x => x.id === id);
  if (!f) return `${back}<div class="empty card" style="margin-top:14px">This flight pool doesn’t exist (it may have been removed).<br><br><button class="btn" onclick="goBack()">Back to flights</button></div>`;
  const m = members(f), n = m.length, d = daysTo(f), price = unitPrice(f, Math.max(n, 1)), left = Math.max(0, f.seats - n);
  return `${back}<div class="fl">
  <div class="card"><div class="fh">${badge(f)}<div><b>${esc(f.airline)}</b><span>Flight ${esc(f.number)}</span></div></div>
    <div class="route big"><span>${esc(f.from)}</span><i></i><span>${esc(f.to)}</span></div>
    <div class="fgrid">${info("Date", fmtDate(f.date))}${info("Departure", esc(f.time))}${info("Time left", d >= 0 ? d + " day(s)" : "Departed")}${info("Seats in pool", f.seats)}</div>
    <div class="cd" data-t="${esc(f.date)}T${esc(f.time)}"></div>
    <div class="price"><b>${inr(price)}</b><s>${inr(f.fare)}</s><span class="tag">−${discount(Math.max(n, 1))}%</span></div>
    <p class="note" style="margin:2px 0 8px">Price per person at the current pool size. It drops 2.5% with every member (max 30%).</p>
    <div class="bar"><div style="width:${Math.min(100, n / f.seats * 100)}%"></div></div>
    <div class="meta"><span>${n}/${f.seats} in pool</span><span>${left} seat${left === 1 ? "" : "s"} left</span></div>
  </div>
  <div class="fside">${S.msg ? `<div class="err">${esc(S.msg)}</div>` : ""}${actionsV(f, m)}${travellersV(f, m)}</div></div>`;
}
