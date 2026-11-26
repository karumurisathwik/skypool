/* Airline logos found automatically from the airline name or the flight number.
   Logo services look airlines up by IATA code (IndiGo = 6E, Air India = AI), so we get the code from
   1) a list of well-known airline names, then 2) the flight-number prefix ("6E-204" -> 6E).
   Logos load from public logo CDNs; if one fails the next is tried, then the coloured initials badge shows. */
const NAMES = {
  "indigo": "6E", "indigo airlines": "6E", "air india": "AI", "air india express": "IX", "vistara": "UK", "spicejet": "SG", "spice jet": "SG",
  "akasa air": "QP", "akasa": "QP", "alliance air": "9I", "star air": "S5", "emirates": "EK", "qatar airways": "QR", "qatar": "QR",
  "singapore airlines": "SQ", "etihad": "EY", "etihad airways": "EY", "lufthansa": "LH", "british airways": "BA", "air france": "AF",
  "klm": "KL", "turkish airlines": "TK", "thai airways": "TG", "malaysia airlines": "MH", "cathay pacific": "CX", "qantas": "QF",
  "american airlines": "AA", "delta": "DL", "delta air lines": "DL", "united airlines": "UA", "united": "UA", "airasia": "AK", "air asia": "AK",
  "saudia": "SV", "gulf air": "GF", "oman air": "WY", "kuwait airways": "KU", "flydubai": "FZ", "air arabia": "G9", "srilankan airlines": "UL",
  "biman bangladesh airlines": "BG", "royal jordanian": "RJ", "egyptair": "MS", "ethiopian airlines": "ET", "korean air": "KE",
  "japan airlines": "JL", "ana": "NH", "all nippon airways": "NH", "air china": "CA", "china eastern": "MU", "china southern": "CZ",
  "virgin atlantic": "VS", "iberia": "IB", "swiss": "LX", "austrian airlines": "OS", "finnair": "AY", "aer lingus": "EI",
  "air canada": "AC", "air new zealand": "NZ", "virgin australia": "VA"
};
const norm = s => String(s || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

export function airlineCode(f) {
  const byName = NAMES[norm(f.airline)];
  if (byName) return byName;
  const m = /^\s*([A-Za-z0-9]{2})\s*-?\s*\d{1,4}[A-Za-z]?\s*$/.exec(String(f.number || ""));
  return m && /[A-Za-z]/.test(m[1]) ? m[1].toUpperCase() : "";
}
/* candidate logo URLs, tried in order */
export function logoSrcs(code, size = 96) {
  return [`https://pics.avs.io/${size * 2}/${size * 2}/${code}.png`, `https://img.wway.io/pics/root/${code}@png?exar=1&rs=fit:${size * 2}:${size * 2}`];
}
