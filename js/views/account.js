import { S, $, esc, store, sha, adminOk } from "../state.js";
import { go, toast } from "../ui.js";

export function accountV() {
  return `<form class="card" onsubmit="changePw(event)"><h2 style="margin-top:0">🔑 Change password</h2><p class="note" style="margin-top:0">Signed in as <b>${esc(S.user.admin ? "Admin" : S.user.name + " · " + S.user.id)}</b></p>
<label>Current password</label><input id="cp" type="password" required autocomplete="current-password">
<label>New password</label><input id="np1" type="password" minlength="4" required autocomplete="new-password">
<label>Confirm new password</label><input id="np2" type="password" minlength="4" required autocomplete="new-password">
<div class="err" id="err"></div><button class="btn" style="width:100%">Update password</button></form>`;
}
async function changePw(e) {
  e.preventDefault(); const er = $("#err"), c = $("#cp").value, a = $("#np1").value, b = $("#np2").value;
  if (a !== b) { er.textContent = "New passwords don’t match."; return }
  if (a === c) { er.textContent = "New password must be different from the current one."; return }
  try {
    if (S.user.admin) { if (!await adminOk(c)) { er.textContent = "Current password is wrong."; return } await store.set("settings", "admin", { hash: await sha(a) }) }
    else { const x = await store.get("accounts", S.user.id); if (!x || x.hash !== await sha(c)) { er.textContent = "Current password is wrong."; return } await store.set("accounts", S.user.id, { ...x, hash: await sha(a) }) }
    sessionStorage.setItem("sp_toast", "Password updated ✓");
    location.href = S.user.admin ? "/admin" : "/";
  } catch (x) { er.textContent = "Couldn’t update the password. Try again." }
}
Object.assign(window, { changePw });
