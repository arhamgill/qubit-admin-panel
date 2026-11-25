// Applies the saved colour theme before first paint to avoid a light/dark flash.
// Loaded as an external, nonce'd script so the CSP never needs 'unsafe-inline'.
(function () {
  try {
    var pref = localStorage.getItem("admin-dashboard:theme");
    var dark =
      pref === "dark" ||
      (pref !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  } catch {
    /* storage unavailable: fall back to the light theme */
  }
})();
