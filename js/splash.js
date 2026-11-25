/* Splash screen: shown once per browser session, for about 0.6s on first open.
   Loaded synchronously in <head> so a returning page never flashes it.
   Visibility and timing are pure CSS (see css/styles.css), so even if this script
   fails the splash can never get stuck on screen. */
(function () {
  var root = document.documentElement, seen = false;
  try { seen = sessionStorage.getItem("sp_splash") === "1" } catch (e) {}
  if (seen) { root.classList.add("no-splash"); return }
  try { sessionStorage.setItem("sp_splash", "1") } catch (e) {}
  root.classList.add("splash-on");
})();
