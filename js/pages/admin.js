import { S } from "../state.js";
import { start } from "../ui.js";
import { adminV, fetchAllNames } from "../views/admin.js";

const t = new URLSearchParams(location.search).get("tab");
if (["flights", "add", "people", "requests"].includes(t)) S.tab = t;

start({
  name: "admin", auth: "admin", watch: true, view: adminV,
  key: () => "admin" + S.tab, keep: () => S.tab === "add",
  onJoins: fetchAllNames
});
