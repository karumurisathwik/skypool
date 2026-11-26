import { S, gone } from "../state.js";
import { logoStrip } from "./shared.js";
import { card } from "./home.js";

/* Illustration: airliner above clouds (pure SVG, no external images).
   To use a real photo instead, replace the <svg> inside .h2-art with <img src="/images/hero-plane.jpg" alt="">. */
const SCENE = `<svg class="h2-svg" viewBox="0 0 640 480" preserveAspectRatio="xMidYMid slice" focusable="false">
<defs>
  <radialGradient id="sun" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="var(--sun)" stop-opacity=".95"/><stop offset="1" stop-color="var(--sun)" stop-opacity="0"/></radialGradient>
  <linearGradient id="cl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--cl1)"/><stop offset="1" stop-color="var(--cl2)"/></linearGradient>
  <linearGradient id="fus" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#eef3fa"/><stop offset="1" stop-color="#bccbe0"/></linearGradient>
  <linearGradient id="wing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f7fc"/><stop offset="1" stop-color="#a9bbd5"/></linearGradient>
  <linearGradient id="fin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5aa0ff"/><stop offset="1" stop-color="#0f55c4"/></linearGradient>
  <linearGradient id="eng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3eaf5"/><stop offset="1" stop-color="#8ea3c2"/></linearGradient>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter>
</defs>
<circle cx="520" cy="86" r="120" fill="url(#sun)"/>
<g class="h2-c h2-c1" filter="url(#soft)" opacity=".75"><g transform="translate(40 70) scale(.8)" fill="url(#cl)"><ellipse cx="60" cy="40" rx="60" ry="22"/><circle cx="40" cy="28" r="24"/><circle cx="78" cy="22" r="30"/><circle cx="108" cy="34" r="20"/></g></g>
<g class="h2-c h2-c2" filter="url(#soft)" opacity=".7"><g transform="translate(430 190) scale(.65)" fill="url(#cl)"><ellipse cx="60" cy="40" rx="60" ry="22"/><circle cx="40" cy="28" r="24"/><circle cx="78" cy="22" r="30"/><circle cx="108" cy="34" r="20"/></g></g>
<g transform="translate(18 122) rotate(-5 300 120)"><g class="h2-plane">
  <path d="M-6,128 H56 M10,140 H70" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>
  <path d="M96,120 L48,140 L72,140 L142,126 Z" fill="#aebfd8"/>
  <path d="M56,98 L62,24 L98,24 L178,98 Z" fill="url(#fin)"/>
  <path d="M70,64 L97,64 L114,80 L72,80 Z" fill="#fff" fill-opacity=".9"/>
  <path d="M54,96 C100,98 200,98 330,98 L470,100 C525,102 565,114 584,128 C566,142 528,152 470,154 L250,154 C160,154 100,146 54,120 Z" fill="url(#fus)" stroke="#b3c3da" stroke-width=".8"/>
  <path d="M300,136 L198,204 L248,206 L390,142 Z" fill="url(#wing)" stroke="#9fb1cc" stroke-width=".8"/>
  <rect x="252" y="162" width="72" height="26" rx="13" fill="url(#eng)" stroke="#8ea3c2" stroke-width=".8"/>
  <ellipse cx="320" cy="175" rx="6" ry="12" fill="#6f86a8"/><ellipse cx="320" cy="175" rx="3.5" ry="8" fill="#22344f"/>
  <g fill="#27456f">
    <rect x="128" y="113" width="8" height="11" rx="4"/><rect x="146" y="113" width="8" height="11" rx="4"/><rect x="164" y="113" width="8" height="11" rx="4"/><rect x="182" y="113" width="8" height="11" rx="4"/><rect x="200" y="113" width="8" height="11" rx="4"/><rect x="218" y="113" width="8" height="11" rx="4"/><rect x="236" y="113" width="8" height="11" rx="4"/><rect x="254" y="113" width="8" height="11" rx="4"/><rect x="272" y="113" width="8" height="11" rx="4"/><rect x="290" y="113" width="8" height="11" rx="4"/><rect x="308" y="113" width="8" height="11" rx="4"/><rect x="326" y="113" width="8" height="11" rx="4"/><rect x="344" y="113" width="8" height="11" rx="4"/><rect x="362" y="113" width="8" height="11" rx="4"/><rect x="380" y="113" width="8" height="11" rx="4"/><rect x="398" y="113" width="8" height="11" rx="4"/><rect x="416" y="113" width="8" height="11" rx="4"/><rect x="434" y="113" width="8" height="11" rx="4"/>
  </g>
  <path d="M520,108 L548,106 L566,118 L526,118 Z" fill="#1c3558"/>
  <text x="150" y="143" font-family="Inter,Arial,sans-serif" font-size="19" font-weight="800" font-style="italic" fill="#1668e3">SkyPool</text>
</g></g>
<g class="h2-c h2-c3" fill="url(#cl)"><g transform="translate(-30 360) scale(1.5)"><ellipse cx="60" cy="40" rx="60" ry="22"/><circle cx="40" cy="28" r="24"/><circle cx="78" cy="22" r="30"/><circle cx="108" cy="34" r="20"/></g><g transform="translate(250 392) scale(1.7)"><ellipse cx="60" cy="40" rx="60" ry="22"/><circle cx="40" cy="28" r="24"/><circle cx="78" cy="22" r="30"/><circle cx="108" cy="34" r="20"/></g><g transform="translate(470 350) scale(1.4)"><ellipse cx="60" cy="40" rx="60" ry="22"/><circle cx="40" cy="28" r="24"/><circle cx="78" cy="22" r="30"/><circle cx="108" cy="34" r="20"/></g></g>
</svg>`;

const CARDS = `
<div class="h2-fc h2-route">
  <div class="h2-fc-top"><span>Example pool</span><b>Open</b></div>
  <div class="h2-r"><b>DEL</b><i>✈</i><b>BOM</b></div>
  <div class="h2-fc-sub">10 Dec · 07:15</div>
</div>
<div class="h2-fc h2-seats">
  <div class="h2-fc-top"><span>Group seats</span><b>8 / 12</b></div>
  <div class="h2-av"><i style="background:#1668e3">A</i><i style="background:#0a8f6a">R</i><i style="background:#e07b00">S</i><i style="background:#8a3ffc">M</i><i class="more">+4</i></div>
  <div class="h2-bar"><div style="width:67%"></div></div>
  <div class="h2-fc-sub">20% group discount unlocked</div>
</div>`;

export function welcomeV() {
  const ppl = new Set(S.joins.map(j => j.uid)).size;
  const open = S.flights.filter(f => !gone(f)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 6);
  return `<section class="h2">
  <div class="h2-copy">
    <span class="h2-pill">✈ Group flight pooling</span>
    <h1>Good flights are better <em>when shared.</em></h1>
    <p>SkyPool helps travellers connect and coordinate group flight bookings. Join a pool for the same flight, split the cost, and unlock a bigger discount with every traveller who joins.</p>
    <div class="h2-cta"><a class="btn big" href="#pools">Explore Flight Pools</a><a class="btn ghost big" href="#how">How It Works</a></div>
    <div class="h2-stats"><div><b>${S.flights.length}</b><span>live pools</span></div><div><b>${ppl}</b><span>travellers</span></div><div><b>30%</b><span>max discount</span></div></div>
  </div>
  <div class="h2-art" aria-hidden="true">${SCENE}${CARDS}</div>
</section>
${logoStrip()}
<section id="pools" class="sec"><h2>Live flight pools</h2>
${open.length ? `<div class="grid">${open.map(card).join("")}</div><p class="note" style="text-align:center;margin-top:14px">Log in or create a free account to join a pool.</p>` : `<div class="empty card">No flight pools are open right now. Check back soon!</div>`}</section>
<section id="how" class="sec"><h2>How it works</h2>
<div class="grid how"><div class="card"><div class="n">1</div><b>Pick a flight</b><p class="note">Browse pools published for popular routes.</p></div>
<div class="card"><div class="n">2</div><b>Join the pool</b><p class="note">Other travellers join with just an ID. The fare drops as the pool fills.</p></div>
<div class="card"><div class="n">3</div><b>Confirm &amp; fly</b><p class="note">Confirm your seat within 3 weeks of departure.</p></div></div></section>`;
}
