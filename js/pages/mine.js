import { start } from "../ui.js";
import { mineV } from "../views/mine.js";

start({ name: "mine", auth: "nonadmin", watch: true, view: mineV });
