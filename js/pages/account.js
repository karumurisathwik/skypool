import { start } from "../ui.js";
import { accountV } from "../views/account.js";

start({ name: "account", auth: "user", view: accountV, keep: () => true });
