import { S, gone } from "../state.js";
import { logoStrip } from "./shared.js";
import { card } from "./home.js";

/* Hero photo: AVIF (35 KB) with JPEG fallback for older browsers. */
const SCENE = `<picture>
  <source srcset="/images/hero-plane.avif" type="image/avif">
  <img class="h2-img" src="/images/hero-plane.jpg" width="1400" height="935" alt="" fetchpriority="high" decoding="async">
</picture>`;

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
