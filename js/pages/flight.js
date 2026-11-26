import { start } from "../ui.js";
import { flightV } from "../views/flight.js";
import { fetchAllNames } from "../views/admin.js";

start({ name: "flight", watch: true, view: flightV, onJoins: fetchAllNames });
