import { start } from "../ui.js";
import { signupV as view } from "../views/auth.js";

start({ name: "signup", auth: "guest", view, keep: () => true });
