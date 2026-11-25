import { S } from "../state.js";
import { logoStrip, skyHTML } from "./shared.js";

export function welcomeV() {
  const ppl = new Set(S.joins.map(j => j.uid)).size;
  return `<section class="wel">${skyHTML}<div class="wc"><span class="pill">✈ Welcome to SkyPool</span><h1>Fly together.<br><em>Pay less.</em></h1>
  <p>Airfares keep climbing. Team up with fellow travellers on the same flight and split the fare. The bigger the pool, the bigger the discount.</p>
  <div class="row"><button class="btn big" onclick="go('signup')">Create account</button><button class="btn ghost big" onclick="go('login')">Log in</button></div>
  <div class="live"><div><b>${S.flights.length}</b><span>live pools</span></div><div><b>${ppl}</b><span>travellers</span></div><div><b>30%</b><span>max discount</span></div></div></div></section>
  ${logoStrip()}
  <div class="grid how"><div class="card"><div class="n">1</div><b>Pick a flight</b><p class="note">Browse pools published for popular routes.</p></div>
  <div class="card"><div class="n">2</div><b>Join the pool</b><p class="note">Other travellers join with just an ID. The fare drops as the pool fills.</p></div>
  <div class="card"><div class="n">3</div><b>Confirm &amp; fly</b><p class="note">Confirm your seat within 3 weeks of departure.</p></div></div>`;
}
