// Applies saved UI preferences before first paint, so there is no theme or sidebar flash.
// Loaded as an external, nonce'd script so the CSP never needs 'unsafe-inline'.
(function () {
  var root = document.documentElement;
  try {
    var pref = localStorage.getItem("admin-dashboard:theme");
    var dark =
      pref === "dark" ||
      (pref !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";

    var sidebar = localStorage.getItem("admin-dashboard:sidebar");
    root.dataset.sidebar = sidebar === "collapsed" ? "collapsed" : "expanded";
  } catch {
    /* storage unavailable: fall back to the defaults */
  }
})();
