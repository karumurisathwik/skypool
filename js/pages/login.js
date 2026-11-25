import { start } from "../ui.js";
import { loginV as view } from "../views/auth.js";

start({ name: "login", auth: "guest", view, keep: () => true });
