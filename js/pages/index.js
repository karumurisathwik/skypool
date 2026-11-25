import { S } from "../state.js";
import { start } from "../ui.js";
import { homeV } from "../views/home.js";
import { welcomeV } from "../views/welcome.js";

start({
  name: "home", watch: true,
  view: () => S.user ? homeV() : welcomeV(),
  key: () => S.user ? "home" : "welcome" + S.flights.length + "/" + S.joins.length,
  keep: () => !S.user
});
