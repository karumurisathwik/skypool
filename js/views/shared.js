import { S, esc, COLORS, badge } from "../state.js";

const DEF_AIR = [["IndiGo", 0], ["Air India", 1], ["Vistara", 2], ["SpiceJet", 3], ["Akasa Air", 4], ["Emirates", 5], ["Qatar Airways", 6], ["Singapore Airlines", 0]];
function airlines() {
  const m = new Map();
  S.flights.forEach(f => { const o = m.get(f.airline); if (!o || (!o.logo && f.logo)) m.set(f.airline, { airline: f.airline, number: f.number, color: f.color, logo: f.logo }) });
  DEF_AIR.forEach(([a, c]) => { if (!m.has(a)) m.set(a, { airline: a, color: COLORS[c] }) });
  return [...m.values()].slice(0, 12);
}
export function logoStrip() {
  const it = airlines().map(a => `<div class="lg">${badge(a)}<span>${esc(a.airline)}</span></div>`).join("");
  return `<div class="marq"><div class="track">${it}${it}</div></div>`;
}
export const skyHTML = `<div class="sky"><span class="cloud c1"></span><span class="cloud c2"></span><span class="cloud c3"></span><span class="plane">✈️</span></div>`;
export function authWrap(f) {
  return `<div class="auth"><aside class="art">${skyHTML}<h2>Fly together.<br>Pay less.</h2><p>Join a pool, split the fare, land a better deal.</p>${logoStrip()}</aside><div class="formside">${f}</div></div>`;
}
