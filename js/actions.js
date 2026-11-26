/* Pool actions shared by several pages (My pools, flight details, admin).
   Rules: only the passenger confirms. A confirmed passenger cannot leave directly – he applies for
   cancellation and the admin approves (ticket cancelled, removed from pool) or declines.
   The admin can only remove passengers and handle cancellation requests, never confirm. */
import { S, store, daysTo, gone } from "./state.js";
import { render } from "./ui.js";

const joinById = id => S.joins.find(x => x.id === id);
const flightOf = j => S.flights.find(x => x.id === j.flightId);
const saveJoin = (j, patch) => { const { id, ...rest } = j; return store.set("joins", id, { ...rest, ...patch }) };
const mineJoin = id => { const j = joinById(id); return j && S.user && !S.user.admin && j.uid === S.user.id ? j : null };
const adminJoin = id => S.user?.admin ? joinById(id) : null;

/* open the flight details page (clicks on buttons/links inside a card are ignored) */
export function openFlight(id, e) {
  if (e) {
    if (e.target.closest && e.target.closest("button,a,input,select,textarea,label")) return;
    if (e.type === "keydown") { if (e.key !== "Enter" && e.key !== " ") return; e.preventDefault() }
  }
  location.href = "/flight?id=" + encodeURIComponent(id);
}

/* ---- passenger ---- */
export async function confirmJ(id) {
  const j = mineJoin(id), f = j && flightOf(j); if (!f || j.confirmed) return;
  const d = daysTo(f);
  if (d > 21 || d < 0) { S.msg = "Confirmation opens only within 3 weeks of departure."; render(); return }
  S.msg = ""; await saveJoin(j, { confirmed: true });
}
/* two-tap leave (unconfirmed passengers only) */
export async function leave(id) {
  const j = mineJoin(id); if (!j || j.confirmed) return;
  if (S.lv !== id) { S.lv = id; render(); return }
  S.lv = null; await store.del("joins", id); render();
}
/* confirmed passengers apply for cancellation (two taps) */
export async function applyCancel(id) {
  const j = mineJoin(id), f = j && flightOf(j); if (!f || !j.confirmed || j.cancelReq || gone(f)) return;
  if (S.cx !== id) { S.cx = id; render(); return }
  S.cx = ""; await saveJoin(j, { cancelReq: true, cancelAt: Date.now() });
}
export async function withdrawCancel(id) {
  const j = mineJoin(id); if (!j || !j.cancelReq) return;
  await saveJoin(j, { cancelReq: false, cancelAt: 0 });
}

/* ---- admin ---- */
/* two-tap remove of a passenger from a pool */
export async function removeM(id) {
  if (!adminJoin(id)) return;
  if (S.rm !== id) { S.rm = id; render(); return }
  S.rm = null; await store.del("joins", id); render();
}
/* approve a cancellation: ticket cancelled, passenger removed from the pool (so the request disappears) */
export async function approveCancel(id) {
  const j = adminJoin(id); if (!j || !j.cancelReq) return;
  if (S.ar !== id) { S.ar = id; render(); return }
  S.ar = ""; await store.del("joins", id); render();
}
export async function declineCancel(id) {
  const j = adminJoin(id); if (!j || !j.cancelReq) return;
  S.ar = ""; await saveJoin(j, { cancelReq: false, cancelAt: 0 });
}

Object.assign(window, { openFlight, confirmJ, leave, applyCancel, withdrawCancel, removeM, approveCancel, declineCancel });
