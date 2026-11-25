import { $, store, sha, adminOk } from "../state.js";
import { login, adminId } from "../ui.js";
import { authWrap } from "./shared.js";

export function loginV() {
  return authWrap(`<form class="card" onsubmit="doLogin(event)"><h2 style="margin-top:0">Log in</h2>
<label>ID</label><input id="id" inputmode="numeric" required autofocus autocomplete="username">
<label>Password</label><input id="pw" type="password" required autocomplete="current-password">
<div class="err" id="err"></div><button class="btn" style="width:100%">Log in</button>
<p class="note">New here? <a href="/signup">Create an account</a>. Admin? Log in with your admin ID.</p></form>`);
}
export function signupV() {
  return authWrap(`<form class="card" onsubmit="doSignup(event)"><h2 style="margin-top:0">Create account</h2>
<label>Your name</label><input id="nm" required autofocus maxlength="40">
<label>10-digit ID</label><div class="row" style="flex-wrap:nowrap"><input id="id" inputmode="numeric" pattern="\\d{10}" maxlength="10" required><button type="button" class="btn ghost" onclick="$('#id').value=String(Math.floor(1e9+Math.random()*9e9))">Random</button></div>
<label>Password</label><input id="pw" type="password" minlength="4" required autocomplete="new-password">
<div class="err" id="err"></div><button class="btn" style="width:100%">Sign up</button>
<p class="note">Only your ID is shown to other travellers — never your name. Already registered? <a href="/login">Log in</a>.</p></form>`);
}

async function doSignup(e) {
  e.preventDefault(); const id = $("#id").value.trim(), nm = $("#nm").value.trim(), pw = $("#pw").value, er = $("#err");
  if (!nm) { er.textContent = "Please enter your name."; return }
  if (!/^\d{10}$/.test(id)) { er.textContent = "ID must be exactly 10 digits."; return }
  try {
    if (await store.get("accounts", id)) { er.textContent = "That ID is taken — try another."; return }
    await store.set("accounts", id, { name: nm, hash: await sha(pw) }); login({ id, name: nm });
  } catch (x) { er.textContent = "Couldn’t sign up. Try again." }
}
async function doLogin(e) {
  e.preventDefault(); const id = $("#id").value.trim(), pw = $("#pw").value, er = $("#err");
  if (id === adminId()) { try { await adminOk(pw) ? login({ id: "admin", name: "Admin", admin: true }) : er.textContent = "Wrong admin password." } catch (x) { er.textContent = "Couldn’t log in. Try again." } return }
  try { const a = await store.get("accounts", id); if (!a || a.hash !== await sha(pw)) { er.textContent = "Invalid ID or password."; return } login({ id, name: a.name }) }
  catch (x) { er.textContent = "Couldn’t log in. Try again." }
}
Object.assign(window, { doLogin, doSignup });
